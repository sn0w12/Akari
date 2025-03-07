import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { Chapter } from "@/app/api/interfaces";
import { generateCacheHeaders } from "@/lib/cache";
import { getErrorMessage } from "@/lib/utils";
import { hasConsentFor } from "@/lib/cookies";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
    cleanText,
} from "@/lib/utils";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string; subId: string }> },
): Promise<Response> {
    clearPerformanceMetrics();
    time("Total API Request");
    const params = await props.params;
    const { id, subId } = params;
    const cookieStore = await cookies();
    const server = cookieStore.get(`manga_server`)?.value || "1";
    let serviceUrl = "https://ddos-guard.net";

    const jar = new CookieJar();

    try {
        time("Fetch HTML");
        const instance = axios.create({
            headers: {
                "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
                "Accept-Language":
                    req.headers.get("accept-language") || "en-US,en;q=0.9",
                Referer: serviceUrl,
            },
        });

        const wrappedInstance = wrapper(instance);
        wrappedInstance.defaults.jar = jar;

        // Fetch the HTML content of the page
        const response = await wrappedInstance.get(
            `https://nelomanga.com/manga/${id}/${subId}`,
            {
                headers: {
                    cookie: `content_server=server${server}`,
                    "User-Agent":
                        req.headers.get("user-agent") || "Mozilla/5.0",
                    "Accept-Language":
                        req.headers.get("accept-language") || "en-US,en;q=0.9",
                },
                timeout: 10000,
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
        const breadcrumbLinks = $(".breadcrumb a");
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
                chapters.push({
                    value:
                        chapterValue
                            .split("/")
                            .pop()
                            ?.replace("chapter-", "")
                            ?.replace("-", ".") || "",
                    label: cleanText(chapterText),
                });
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

        const nextChapterLink = $(".back").attr("href");
        const nextChapter = nextChapterLink
            ? `${id}/${nextChapterLink.split("/").pop()}`
            : id;
        const lastChapterLink = $(".next").attr("href");
        const lastChapter = lastChapterLink
            ? `${id}/${lastChapterLink.split("/").pop()}`
            : id;

        const imageContainer = $(".container-chapter-reader");
        const token = imageContainer.find('input[name="_token"]').attr("value");

        const scriptTags = $("script");

        let mangaId: string | null = null;
        let chapterId: string | null = null;

        // Loop through script tags to find the one containing glb_story_data
        scriptTags.each((i, elem) => {
            const scriptContent = $(elem).html();

            if (scriptContent) {
                // Extract glb_story_data and glb_chapter_data using regex
                if (scriptContent.includes("window.chapter_data")) {
                    const comicIdMatch = scriptContent.match(
                        /"comic_id":\s*"(\d+)"/,
                    );
                    const chapterIdMatch = scriptContent.match(
                        /"chapter_id":\s*"(\d+)"/,
                    );

                    if (comicIdMatch && comicIdMatch[1]) {
                        mangaId = comicIdMatch[1];
                    }
                    if (chapterIdMatch && chapterIdMatch[1]) {
                        chapterId = chapterIdMatch[1];
                    }
                }
            }
        });

        const responseData: Chapter = {
            id: subId,
            title: cleanText(mangaTitle),
            chapter: cleanText(chapterTitle),
            chapters: chapters,
            pages: pages,
            parentId: parent,
            nextChapter: nextChapter,
            lastChapter: lastChapter,
            images: images,
            mangaId: mangaId,
            chapterId: chapterId,
            token: token || "",
        };
        timeEnd("Extract Data");
        timeEnd("Total API Request");

        const mangaResponse = NextResponse.json(responseData, {
            status: 200,
            headers: {
                contentType: "application/json",
                ...generateCacheHeaders(3600, 604800, 2592000),
            },
        });

        if (hasConsentFor(cookieStore, "functional")) {
            mangaResponse.cookies.set("manga_server", server, {
                maxAge: 31536000,
                path: "/",
            });
        }

        return mangaResponse;
    } catch (error: unknown) {
        timeEnd("Total API Request");
        const axiosError = error as AxiosError;
        return NextResponse.json(
            {
                result: "error",
                data: getErrorMessage(axiosError.status),
                performance: performanceMetrics,
            },
            { status: axiosError.status },
        );
    }
}
