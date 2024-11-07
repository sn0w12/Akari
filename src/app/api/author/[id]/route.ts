import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 1 * 60 * 60 }); // 1 hour
export const dynamic = "force-dynamic";

interface Manga {
    id: string;
    image: string | undefined;
    title: string;
    chapter: string;
    chapterUrl: string | undefined;
    description?: string;
    rating?: string;
    views?: string;
    date?: string;
    author?: string;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const authorId = params.id;
        const orderBy = searchParams.get("orderBy") || "";
        const page = searchParams.get("page") || "1";
        const cacheKey = `author_${authorId}_${orderBy}_${page}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return new Response(JSON.stringify(cachedData), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!authorId) {
            return NextResponse.json(
                { result: "error", data: "No valid author included in search" },
                { status: 400 },
            );
        }

        // Construct the search URL
        const searchUrl = `https://manganato.com/author/story/${authorId}?page=${page}&orby=${orderBy}`;

        // Fetch the data from Manganato
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        const mangaList: Manga[] = [];

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

            mangaList.push({
                id: mangaUrl?.split("/").pop() || "",
                image: imageUrl,
                title: title,
                chapter: latestChapter,
                chapterUrl: chapterUrl,
                rating: rating,
                author: author,
                date: date,
                views: views?.replace("View : ", ""),
            });
        });

        const totalStories: number = mangaList.length;
        const lastPageElement = $("a.page-last");
        const totalPages: number = lastPageElement.length
            ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
            : 1;

        const result = {
            mangaList,
            metaData: { totalStories, totalPages },
        };
        cache.set(cacheKey, result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching author search results:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
