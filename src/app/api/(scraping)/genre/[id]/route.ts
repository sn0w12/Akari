import { NextResponse } from "next/server";
import { generateCacheHeaders } from "@/lib/cache";
import { fetchGenreData } from "@/lib/scraping";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    try {
        const { searchParams } = new URL(request.url);
        const genre = params.id;
        const orderBy = searchParams.get("orderBy") || "latest";
        const page = searchParams.get("page") || "1";

        const result = await fetchGenreData(genre, page, orderBy);

        if ("result" in result) {
            return NextResponse.json(result, { status: 400 });
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
            },
        });
    } catch (error) {
        console.error("Error fetching genre results:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
