import NodeCache from "node-cache";
import { generateCacheHeaders } from "@/lib/cache";
import { processMangaList } from "@/lib/mangaNato";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
} from "@/lib/utils";

const cache = new NodeCache({ stdTTL: 5 * 60 }); // 5 minutes
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    clearPerformanceMetrics();
    time("Total API Request");
    try {
        const { searchParams } = new URL(req.url);
        const page: string = searchParams.get("page") || "1";
        const cacheKey = `mangaList_popular_${page}`;

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
                        ...generateCacheHeaders(60),
                    },
                },
            );
        }

        time("Process Manga List");
        // Construct the URL with the page number
        const url = `https://${process.env.NEXT_MANGA_URL}/manga-list/hot-manga?page=${page}`;
        const result = await processMangaList(url, page);
        timeEnd("Process Manga List");

        cache.set(cacheKey, result);
        timeEnd("Total API Request");

        return new Response(
            JSON.stringify({
                ...result,
                performance: performanceMetrics,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    ...generateCacheHeaders(86400, 604800, 2592000),
                },
            },
        );
    } catch (error) {
        timeEnd("Total API Request");
        console.error(error);
        return new Response(
            JSON.stringify({
                error: "Failed to fetch latest manga",
                performance: performanceMetrics,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
