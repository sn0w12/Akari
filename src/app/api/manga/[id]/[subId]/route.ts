import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

import { Chapter } from "@/app/api/interfaces";

interface UserData {
    user_version: string;
    user_name: string | null;
    user_image: string;
    user_data: string | null;
}

export async function GET(
    req: Request,
    { params }: { params: { id: string; subId: string } },
): Promise<Response> {
    const { id, subId } = params;
    const { searchParams } = new URL(req.url);

    const userData: UserData = {
        user_version: "2.3",
        user_name: searchParams.get("user_name"),
        user_image: "https://user.manganelo.com/avt.png",
        user_data: searchParams.get("user_data"),
    };

    try {
        // Fetch the HTML content of the page
        const response = await axios.get(
            `https://chapmanganato.to/${id}/${subId}`,
            {
                headers: {
                    cookie: `user_acc=${JSON.stringify(userData)}; content_server=server2`,
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

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error fetching manga chapter:", error);
        return NextResponse.json(
            { error: "Failed to fetch manga chapter data" },
            { status: 500 },
        );
    }
}
