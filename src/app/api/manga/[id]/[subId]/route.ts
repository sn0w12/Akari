import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import NodeCache from "node-cache";
import { generateCacheHeaders } from "@/lib/cache";
import { scrapeMangaChapter } from "@/lib/mangaNato";

const cache = new NodeCache({ stdTTL: 24 * 60 * 60 }); // 24 hours

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string; subId: string }> },
): Promise<Response> {
    const params = await props.params;
    const { id, subId } = params;
    const cookieStore = await cookies();
    const server = cookieStore.get(`manga_server`)?.value || "1";
    const cacheKey = `manga_${id}_${subId}_${server}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(300),
            },
        });
    }

    try {
        const responseData = await scrapeMangaChapter(id, subId);

        if (responseData.storyData && responseData.chapterData) {
            cache.set(cacheKey, responseData);
        }

        const mangaResponse = NextResponse.json(responseData, {
            status: 200,
            headers: {
                contentType: "application/json",
                ...generateCacheHeaders(300),
            },
        });
        mangaResponse.cookies.set("manga_server", server, {
            maxAge: 31536000,
            path: "/",
        });

        return mangaResponse;
    } catch (error) {
        console.error("Error fetching manga chapter:", error);
        return NextResponse.json(
            { error: "Failed to fetch manga chapter data" },
            { status: 500 },
        );
    }
}
