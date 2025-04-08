import { NextResponse } from "next/server";
import { generateCacheHeaders } from "@/lib/cache";

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
        const response = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/home/search/json?searchword=${encodeURIComponent(query.replaceAll(" ", "_"))}`,
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                    "Sec-GPC": "1",
                    Connection: "keep-alive",
                    Host: `${process.env.NEXT_MANGA_URL}`,
                    Referer: `https://${process.env.NEXT_MANGA_URL}/`,
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    TE: "trailers",
                },
            },
        );
        const data = await response.json();
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
