import { NextResponse } from "next/server";
import { generateCacheHeaders } from "@/lib/cache";
import { fetchSearchData } from "@/lib/scraping";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json(
            { error: "Search query is required" },
            { status: 400 },
        );
    }

    try {
        const data = await fetchSearchData(query);
        return NextResponse.json(data, {
            headers: {
                ...generateCacheHeaders(600),
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch search results" },
            { status: 500 },
        );
    }
}
