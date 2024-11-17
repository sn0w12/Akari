import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { Chapter } from "@/app/api/interfaces";
import NodeCache from "node-cache";
import { badImages } from "@/lib/badImages";

const cache = new NodeCache({ stdTTL: 24 * 60 * 60 }); // 24 hours

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string; subId: string }> },
): Promise<Response> {
    const params = await props.params;
    const { id, subId } = params;
    const cookieStore = await cookies();
    const userAcc = cookieStore.get("user_acc")?.value || null;
    const server = cookieStore.get(`manga_server`)?.value || "1";
    const cacheKey = `manga_${id}_${subId}_${server}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // Fetch the HTML content of the page
        const response = await axios.get(
            `https://chapmanganato.to/${id}/${subId}`,
            {
                headers: {
                    cookie: `user_acc=${userAcc}; content_server=server${server}`,
                    "User-Agent":
                        req.headers.get("user-agent") || "Mozilla/5.0",
                    "Accept-Language":
                        req.headers.get("accept-language") || "en-US,en;q=0.9",
                },
            },
        );
        const html = response.data;

        // Load the HTML into cheerio for parsing
        const $ = cheerio.load(html);

        // Extract the title and chapter name from the panel-breadcrumb
        const breadcrumbLinks = $(".panel-breadcrumb a");
        const mangaTitle = $(breadcrumbLinks[1]).text();
        const parent =
            $(breadcrumbLinks[1]).attr("href")?.split("/").pop() || "";
        const chapterTitle = $(breadcrumbLinks[2]).text();
        const chapters: Chapter["chapters"] = [];
        const chapterSelect = $(".navi-change-chapter").first();
        chapterSelect.find("option").each((index, element) => {
            const chapterValue = $(element).attr("data-c");
            const chapterText = $(element).text();
            if (chapterValue) {
                chapters.push({ value: chapterValue, label: chapterText });
            }
        });

        // Extract all image URLs from the container-chapter-reader div
        const imageElements = $(".container-chapter-reader img");
        const images: string[] = [];
        imageElements.each((index, element) => {
            const imageUrl = $(element).attr("src");
            if (imageUrl) images.push(imageUrl);
        });

        const pages = images.length;

        const nextChapterLink = $(".navi-change-chapter-btn-next").attr("href");
        const nextChapter = nextChapterLink
            ? `${id}/${nextChapterLink.split("/").pop()}`
            : id;
        const lastChapterLink = $(".navi-change-chapter-btn-prev").attr("href");
        const lastChapter = lastChapterLink
            ? `${id}/${lastChapterLink.split("/").pop()}`
            : id;

        const scriptTags = $(".body-site script");

        let glbStoryData: string | null = null;
        let glbChapterData: string | null = null;

        // Loop through script tags to find the one containing glb_story_data
        scriptTags.each((i, elem) => {
            const scriptContent = $(elem).html();

            if (scriptContent && scriptContent.includes("glb_story_data")) {
                // Extract glb_story_data and glb_chapter_data using regex
                const storyDataMatch = scriptContent.match(
                    /glb_story_data\s*=\s*'([^']+)'/,
                );
                const chapterDataMatch = scriptContent.match(
                    /glb_chapter_data\s*=\s*'([^']+)'/,
                );

                if (storyDataMatch && storyDataMatch[1]) {
                    glbStoryData = storyDataMatch[1];
                }
                if (chapterDataMatch && chapterDataMatch[1]) {
                    glbChapterData = chapterDataMatch[1];
                }
            }
        });

        // Load and check first and last images
        if (images.length > 0) {
            try {
                const [firstImageResponse, lastImageResponse] =
                    await Promise.all([
                        axios.get(images[0], {
                            responseType: "arraybuffer",
                            headers: {
                                Referer: "https://manganato.com",
                                "User-Agent": "Mozilla/5.0",
                            },
                        }),
                        axios.get(images[images.length - 1], {
                            responseType: "arraybuffer",
                            headers: {
                                Referer: "https://manganato.com",
                                "User-Agent": "Mozilla/5.0",
                            },
                        }),
                    ]);

                const firstImageBase64 = Buffer.from(
                    firstImageResponse.data,
                ).toString("base64");
                const lastImageBase64 = Buffer.from(
                    lastImageResponse.data,
                ).toString("base64");

                if (badImages.includes(firstImageBase64)) {
                    images.shift();
                }
                if (badImages.includes(lastImageBase64)) {
                    images.pop();
                }
            } catch (error) {
                console.error("Error checking images:", error);
            }
        }

        // Return the response as JSON
        const responseData: Chapter = {
            title: mangaTitle,
            chapter: chapterTitle,
            chapters: chapters,
            pages: pages,
            parentId: parent,
            nextChapter: nextChapter,
            lastChapter: lastChapter,
            images: images,
            storyData: glbStoryData,
            chapterData: glbChapterData,
        };

        if (responseData.storyData && responseData.chapterData) {
            cache.set(cacheKey, responseData);
        }

        const mangaResponse = NextResponse.json(responseData);
        mangaResponse.cookies.set("manga_server", server, {
            maxAge: 31536000,
            path: "/",
        });

        return mangaResponse;
    } catch (error) {
        console.error("Error fetching manga chapter:", error);
        return NextResponse.json(
            { error: "Failed to fetch manga chapter data" },
            { status: 500 },
        );
    }
}
