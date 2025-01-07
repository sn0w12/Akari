import { NextResponse } from "next/server";
import NodeCache from "node-cache";
import { generateCacheHeaders } from "@/lib/cache";
import { scrapeAuthorPage } from "@/lib/mangaNato";

const cache = new NodeCache({ stdTTL: 1 * 60 * 60 }); // 1 hour
export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    try {
        const { searchParams } = new URL(request.url);
        const authorId = params.id;
        const orderBy = searchParams.get("orderBy") || "latest";
        const page = searchParams.get("page") || "1";
        const cacheKey = `author_${authorId}_${orderBy}_${page}`;

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

        if (!authorId) {
            return NextResponse.json(
                { result: "error", data: "No valid author included in search" },
                { status: 400 },
            );
        }

        const result = await scrapeAuthorPage(authorId, orderBy, Number(page));
        cache.set(cacheKey, result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
            },
        });
    } catch (error) {
        console.error("Error fetching author search results:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
