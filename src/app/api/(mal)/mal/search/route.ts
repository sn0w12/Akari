import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let query = searchParams.get("q");

        if (!query) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 },
            );
        }

        if (query.length > 100) {
            query = query.slice(0, 100);
        }
        const response = await fetch(
            `https://myanimelist.net/search/prefix.json?type=manga&keyword=${encodeURIComponent(query)}&v=1`,
            {
                headers: {
                    Accept: "application/json",
                    Origin: "https://myanimelist.net",
                    Referer: "https://myanimelist.net/",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                },
            },
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch from MAL" },
                { status: response.status },
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
