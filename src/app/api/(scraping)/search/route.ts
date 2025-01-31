import axios from "axios";
import * as cheerio from "cheerio";
import Fuse from "fuse.js";
import NodeCache from "node-cache";
import { SmallManga } from "../../interfaces";
import { replaceImages } from "@/lib/mangaNato";
import { generateCacheHeaders } from "@/lib/cache";

const cache = new NodeCache({ stdTTL: 20 * 60 }); // 20 minutes
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const query: string = searchParams.get("query") || "";
        const included: string = searchParams.get("included") || "";
        const excluded: string = searchParams.get("excluded") || "";
        const page: string = searchParams.get("page") || "1";
        const cacheKey = `search_${query}_${included}_${excluded}_${page}`;

        function getGenreString(genres: string) {
            if (!genres) return "";

            return (
                "_" +
                genres
                    .split(",")
                    .map((genre) => genre.trim())
                    .join("_") +
                "_"
            );
        }

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return new Response(cachedData as string, {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        // Construct the URL with the page number
        const url = `https://manganato.com/advanced_search?s=all&g_i=${getGenreString(included)}&g_e=${getGenreString(excluded)}&keyw=${query}&page=${page}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const totalPages = $(".page-last").text().match(/\d+/)?.[0] || "1";

        let mangaList: SmallManga[] = [];
        // Scrape the manga list from the website
        $(".content-genres-item").each((index, element) => {
            const mangaElement = $(element);
            const imageUrl = mangaElement.find("img.img-loading").attr("src");
            const titleElement = mangaElement.find("h3 a.genres-item-name");
            const title = titleElement.text();
            const mangaUrl = titleElement.attr("href");
            const chapterElement = mangaElement
                .find("a.genres-item-chap")
                .first();
            const latestChapter = chapterElement
                .text()
                .replace("Chapter", "")
                .trim();
            const chapterUrl = chapterElement.attr("href");
            const author = mangaElement.find(".genres-item-author").text();

            let views: string = "";

            $(".item-time").each((i, timeElement) => {
                if (i === 0) views = $(timeElement).text();
            });

            mangaList.push({
                id: mangaUrl?.split("/").pop() || "",
                image: imageUrl || "",
                title: title,
                chapter: latestChapter,
                chapterUrl: chapterUrl || "",
                rating: "0",
                author: author,
                views: views,
                description: "",
                date: "",
            });
        });

        // Use Fuse.js to search the manga list
        const fuse = new Fuse(mangaList, {
            keys: ["title"],
            threshold: 0.6,
        });

        if (query !== "") {
            const searchResults = fuse.search(query.replace("_", " "));
            mangaList = searchResults.map((result) => result.item); // Map Fuse results back to original data
        }
        await replaceImages(mangaList);

        const response = JSON.stringify({
            mangaList,
            metaData: {
                totalStories: mangaList.length,
                totalPages: totalPages,
            },
        });

        cache.set(cacheKey, response);

        return new Response(response, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
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
