import NodeCache from "node-cache";
import { generateCacheHeaders } from "@/lib/cache";
import { processMangaList } from "../latest/route";

const cache = new NodeCache({ stdTTL: 5 * 60 }); // 5 minutes
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const page: string = searchParams.get("page") || "1";
        const cacheKey = `mangaList_popular_${page}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return new Response(JSON.stringify(cachedData), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Construct the URL with the page number
        const url = `https://manganato.com/genre-all/${page}?type=topview`;
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
