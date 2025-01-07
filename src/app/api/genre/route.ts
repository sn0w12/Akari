import { NextResponse } from "next/server";
import NodeCache from "node-cache";
import { generateCacheHeaders } from "@/lib/cache";
import { scrapeMangaGenre } from "@/lib/mangaNato";
import { getGenreIds } from "@/lib/utils";

const cache = new NodeCache({ stdTTL: 5 * 60 }); // 5 minutes
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const includeGenresParam =
            searchParams.get("include")?.replaceAll("_", " ").split(",") || [];
        const excludeGenresParam =
            searchParams.get("exclude")?.replaceAll("_", " ").split(",") || [];
        const orderBy = searchParams.get("orderBy") || "";
        const page = searchParams.get("page") || "1";

        // Convert genre names to their corresponding IDs
        const includeGenres = getGenreIds(includeGenresParam);
        const excludeGenres = getGenreIds(excludeGenresParam);

        const cacheKey = `genre_${includeGenres.join("_")}_${excludeGenres.join("_")}_${orderBy}_${page}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return new Response(JSON.stringify(cachedData), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    ...generateCacheHeaders(600),
                },
            });
        }

        if (includeGenres.length === 0) {
            return NextResponse.json(
                { result: "error", data: "No valid genres included in search" },
                { status: 400 },
            );
        }

        const result = await scrapeMangaGenre(
            includeGenresParam,
            excludeGenresParam,
            orderBy,
            Number(page),
        );
        cache.set(cacheKey, result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
            },
        });
    } catch (error) {
        console.error("Error fetching genre search results:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
