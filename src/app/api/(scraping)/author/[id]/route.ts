import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";
import { replaceImages } from "@/lib/mangaNato";
import { SmallManga } from "../../../interfaces";
import { generateCacheHeaders } from "@/lib/cache";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
} from "@/lib/utils";

const cache = new NodeCache({ stdTTL: 1 * 60 * 60 }); // 1 hour
export const dynamic = "force-dynamic";

function parseDateString(dateStr: string | undefined): number {
    if (!dateStr) return 0;

    // Handle relative dates (e.g. "2 hours ago")
    if (dateStr.includes("ago")) {
        const num = parseInt(dateStr);
        if (dateStr.includes("hour")) {
            return Date.now() - num * 60 * 60 * 1000;
        } else if (dateStr.includes("day")) {
            return Date.now() - num * 24 * 60 * 60 * 1000;
        }
    }

    // Handle "Updated : Nov 08,2024 - 18:51" format
    if (dateStr.includes("Updated")) {
        const [, cleanDate, minutes] = dateStr.split(":"); // "Nov 08,2024 - 18:51"
        const [datePart, timePart] = cleanDate.split("-").map((s) => s.trim());
        const [month, day, year] = datePart.split(/[\s,]+/);
        const [hours] = timePart.split(":");

        const date = new Date(
            parseInt(year),
            getMonthNumber(month),
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
        );
        return date.getTime();
    }

    // Fallback to regular date parsing
    return Date.parse(dateStr);
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
        const cacheKey = `author_${authorId}_${orderBy}_${page}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            timeEnd("Total API Request");
            return new Response(
                JSON.stringify({
                    ...cachedData,
                    performance: performanceMetrics,
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        ...generateCacheHeaders(600, 604800),
                    },
                },
            );
        }

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
        const searchUrl = `https://manganato.com/author/story/${authorId}?page=${page}&orby=${orderBy}`;

        time("Fetch HTML");
        // Fetch the data from Manganato
        const { data } = await axios.get(searchUrl, {
            timeout: 10000,
        });
        timeEnd("Fetch HTML");

        time("Parse HTML");
        const $ = cheerio.load(data);
        const mangaList: SmallManga[] = [];

        // Loop through each .content-genres-item div and extract the relevant information
        $(".search-story-item").each((index, element) => {
            const mangaElement = $(element);
            const imageUrl = mangaElement.find("img.img-loading").attr("src");
            const titleElement = mangaElement.find("h3 a.item-title");
            const title = titleElement.text();
            const mangaUrl = titleElement.attr("href");
            const chapterElement = mangaElement.find("a.item-chapter").first();
            const latestChapter = chapterElement.text();
            const chapterUrl = chapterElement.attr("href");
            const rating = mangaElement.find("em.item-rate").text();
            const author = mangaElement.find(".item-author").text();

            let views: string | undefined;
            let date: string | undefined;

            mangaElement.find(".item-time").each((i, timeElement) => {
                if (i === 0) date = $(timeElement).text();
                if (i === 1) views = $(timeElement).text();
            });

            if (!date || !views) return;

            mangaList.push({
                id: mangaUrl?.split("/").pop() || "",
                image: imageUrl || "",
                title: title,
                chapter: latestChapter,
                chapterUrl: chapterUrl || "",
                rating: rating,
                author: author,
                date: parseDateString(date),
                views: views.replace("View : ", ""),
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

        time("Replace Images");
        await replaceImages(mangaList);
        timeEnd("Replace Images");

        const result = {
            mangaList,
            metaData: { totalStories, totalPages },
            performance: performanceMetrics,
        };
        cache.set(cacheKey, result);
        timeEnd("Total API Request");

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
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
