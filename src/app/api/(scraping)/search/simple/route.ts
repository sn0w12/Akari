import { NextResponse } from "next/server";

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
            `https://www.nelomanga.com/home/search/json?searchword=${encodeURIComponent(query.replaceAll(" ", "_"))}`,
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
                    Accept: "image/avif,image/jxl,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Sec-GPC": "1",
                    Connection: "keep-alive",
                    Referer: "https://www.nelomanga.com/",
                    "Sec-Fetch-Dest": "image",
                    "Sec-Fetch-Mode": "no-cors",
                    "Sec-Fetch-Site": "cross-site",
                },
            },
        );
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch search results" },
            { status: 500 },
        );
    }
}
