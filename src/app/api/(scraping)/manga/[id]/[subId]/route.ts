import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { Chapter } from "@/app/api/interfaces";
import { generateCacheHeaders } from "@/lib/cache";
import { getErrorMessage } from "@/lib/utils";
import { hasConsentFor } from "@/lib/cookies";
import { time, timeEnd } from "@/lib/utils";
import { env } from "process";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string; subId: string }> },
): Promise<Response> {
    time("Total API Request");
    const params = await props.params;
    const { id, subId } = params;
    const cookieStore = await cookies();
    const userAcc = env.NEXT_MANGANATO_ACCOUNT || null;
    const server = cookieStore.get(`manga_server`)?.value || "1";

    try {
        time("Fetch HTML");
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
        timeEnd("Fetch HTML");

        time("Parse HTML");
        // Load the HTML into cheerio for parsing
        const $ = cheerio.load(html);
        timeEnd("Parse HTML");

        time("Extract Data");
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
        timeEnd("Extract Data");

        const mangaResponse = NextResponse.json(responseData, {
            status: 200,
            headers: {
                contentType: "application/json",
                ...generateCacheHeaders(300),
            },
        });
        if (hasConsentFor(cookieStore, "functional")) {
            mangaResponse.cookies.set("manga_server", server, {
                maxAge: 31536000,
                path: "/",
            });
        }

        timeEnd("Total API Request");
        return mangaResponse;
    } catch (error: unknown) {
        timeEnd("Total API Request");
        const axiosError = error as AxiosError;
        return NextResponse.json(
            {
                result: "error",
                data: getErrorMessage(axiosError.status),
            },
            { status: axiosError.status },
        );
    }
}
