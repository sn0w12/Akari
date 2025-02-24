import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateClientCacheHeaders } from "@/lib/cache";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mangaId = searchParams.get("id");

        if (!mangaId) {
            return NextResponse.json(
                {
                    message: "mangaId needed",
                },
                { status: 400 },
            );
        }

        const cookieStore = await cookies();
        const bookmarkStatus = await fetch(
            `https://www.nelomanga.com/manga/status/${mangaId}`,
            {
                headers: {
                    cookie: cookieStore.toString(),
                },
            },
        );

        const data = await bookmarkStatus.json();
        const isBookmarked = data.data.isBookmarked === 1;
        return NextResponse.json(
            { isBookmarked },
            { status: 200, headers: { ...generateClientCacheHeaders(180) } },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Invalid request" },
            { status: 400 },
        );
    }
}
