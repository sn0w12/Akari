import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";
import { replaceImages } from "@/lib/mangaNato";
import { SmallManga } from "../../interfaces";
import { scrapeMangaHome } from "@/lib/mangaNato";

const cache = new NodeCache({ stdTTL: 5 * 60 }); // 5 minutes
export const dynamic = "force-dynamic";

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

        const result = await scrapeMangaHome(Number(page));
        cache.set(cacheKey, result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
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
