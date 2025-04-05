import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { SmallManga } from "../../../interfaces";
import { generateCacheHeaders } from "@/lib/cache";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

function parseDateString(dateStr: string | undefined): number {
    if (!dateStr) return 0;

    // Handle "Feb-23-2025 06:18" format
    const [datePart, timePart] = dateStr.split(" ");
    const [month, day, year] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");

    const date = new Date(
        parseInt(year),
        getMonthNumber(month),
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
    );
    return date.getTime();
}

function getMonthNumber(month: string): number {
    const months: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };
    return months[month] || 0;
}

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    clearPerformanceMetrics();
    time("Total API Request");
    const params = await props.params;
    try {
        const { searchParams } = new URL(request.url);
        const authorId = params.id;
        const orderBy = searchParams.get("orderBy") || "latest";
        const page = searchParams.get("page") || "1";

        if (!authorId) {
            timeEnd("Total API Request");
            return NextResponse.json(
                {
                    result: "error",
                    data: "No valid author included in search",
                    performance: performanceMetrics,
                },
                { status: 400 },
            );
        }

        // Construct the search URL
        const searchUrl = `https://mangakakalot.gg/author/${authorId}?page=${page}&orby=${orderBy}`;

        time("Fetch HTML");
        // Fetch the data from Manganato
        const { data } = await axios.get(searchUrl, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                referer: `https://www.mangakakalot.gg/`,
                host: "www.mangakakalot.gg",
            },
        });
        timeEnd("Fetch HTML");

        time("Parse HTML");
        const $ = cheerio.load(data);
        const mangaList: SmallManga[] = [];

        // Loop through each .story_item div and extract the relevant information
        $(".story_item").each((index, element) => {
            const mangaElement = $(element);
            const imageUrl = mangaElement.find("img").attr("src");
            const titleElement = mangaElement.find("h3.story_name a");
            const title = titleElement.text().trim();
            const mangaUrl = titleElement.attr("href");
            const chapterElement = mangaElement
                .find("em.story_chapter a")
                .first();
            const latestChapter = chapterElement.text().trim();
            const chapterUrl = chapterElement.attr("href");

            let author = "";
            let date = "";
            let views = "";

            mangaElement.find(".story_item_right span").each((i, span) => {
                const text = $(span).text().trim();
                if (text.startsWith("Author")) {
                    author = text.replace("Author(s) : ", "");
                } else if (text.startsWith("Updated")) {
                    date = text.replace("Updated : ", "");
                } else if (text.startsWith("View")) {
                    views = text.replace("View : ", "");
                }
            });

            mangaList.push({
                id: mangaUrl?.split("/manga/").pop() || "",
                image: imageUrl || "",
                title: title,
                chapter: latestChapter,
                chapterUrl: chapterUrl || "",
                rating: "N/A", // Rating is not present in the new HTML
                author: author,
                date: parseDateString(date),
                views: views,
                description: "",
            });
        });
        timeEnd("Parse HTML");

        time("Process Results");
        if (orderBy === "latest") {
            mangaList.sort((a, b) => {
                return Number(b.date) - Number(a.date);
            });
        }
        timeEnd("Process Results");

        const totalStories: number = mangaList.length;
        const lastPageElement = $("a.page-last");
        const totalPages: number = lastPageElement.length
            ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
            : 1;

        if (Number(page) > totalPages) {
            timeEnd("Total API Request");
            return NextResponse.json(
                {
                    result: "error",
                    data: "Page number exceeds total pages",
                    performance: performanceMetrics,
                },
                { status: 400 },
            );
        }

        const result = {
            mangaList,
            metaData: { totalStories, totalPages },
            performance: performanceMetrics,
        };
        timeEnd("Total API Request");

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600, 604800),
            },
        });
    } catch (error) {
        timeEnd("Total API Request");
        console.error("Error fetching author search results:", error);
        return NextResponse.json(
            {
                result: "error",
                data: (error as Error).message,
                performance: performanceMetrics,
            },
            { status: 500 },
        );
    }
}
