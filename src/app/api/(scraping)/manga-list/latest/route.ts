import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";
import { replaceImages } from "@/lib/mangaNato";
import { SmallManga } from "../../../interfaces";
import { generateCacheHeaders } from "@/lib/cache";

const cache = new NodeCache({ stdTTL: 5 * 60 }); // 5 minutes
export const dynamic = "force-dynamic";

export async function processMangaList(url: string, page: string) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const mangaList: SmallManga[] = [];
    const popular: SmallManga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $(".content-genres-item").each((index, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img.img-loading").attr("src");
        const titleElement = mangaElement.find("h3 a.genres-item-name");
        const title = titleElement.text();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find("a.genres-item-chap");
        const latestChapter =
            chapterElement
                .text()
                .replace("-", ".")
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0] || "";
        const chapterUrl = chapterElement.attr("href");
        const description = mangaElement
            .find(".genres-item-description")
            .text()
            .trim();
        const rating = mangaElement.find("em.genres-item-rate").text();
        const views = mangaElement.find(".genres-item-view").text();
        const date = mangaElement.find(".genres-item-time").text();
        const author = mangaElement.find(".genres-item-author").text();

        mangaList.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            description: description,
            rating: rating,
            views: views,
            date: date,
            author: author,
        });
    });

    const totalStories: number = mangaList.length;
    const lastPageElement = $("a.page-last");
    const totalPages: number = lastPageElement.length
        ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
        : 1;

    if (Number(page) > totalPages) {
        return new Response(JSON.stringify({ error: "Page not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    $(".item").each((index, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img.img-loading").attr("src");
        const titleElement = mangaElement.find("h3 a.text-nowrap");
        const title = titleElement.text();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find("a.text-nowrap");
        const latestChapter =
            chapterElement
                .text()
                .replace(title, "")
                .replace("-", ".")
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0] || "";
        const chapterUrl = chapterElement.attr("href");

        popular.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            description: "",
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            date: "",
            rating: "",
            views: "",
            author: "",
        });
    });

    await Promise.all([replaceImages(mangaList), replaceImages(popular)]);

    const result = {
        mangaList,
        popular,
        metaData: { totalStories, totalPages },
    };
    return result;
}

export async function GET(req: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const page: string = searchParams.get("page") || "1";
        const cacheKey = `mangaList_${page}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return new Response(JSON.stringify(cachedData), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Construct the URL with the page number
        const url = `https://manganato.com/genre-all/${page}`;
        const result = await processMangaList(url, page);
        cache.set(cacheKey, result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(60),
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch latest manga" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
