import { NextResponse } from "next/server";
import { generateCacheHeaders } from "@/lib/cache";
import { fetchAuthorData } from "@/lib/scraping";
import { performanceMetrics } from "@/lib/utils";

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

        const result = await fetchAuthorData(authorId, page, orderBy);

        if ("result" in result) {
            return NextResponse.json(
                {
                    ...result,
                    performance: performanceMetrics,
                },
                { status: 400 },
            );
        }

        return new Response(
            JSON.stringify({
                ...result,
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
    } catch (error) {
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
