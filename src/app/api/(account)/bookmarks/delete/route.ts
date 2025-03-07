import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request): Promise<Response> {
    try {
        const { id }: { id: string } = await request.json();
        const cookieStore = await cookies();

        const addBookmark = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/action/bookmark/${id}?action=remove`,
            {
                headers: {
                    cookie: cookieStore.toString(),
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    referer: `https://${process.env.NEXT_MANGA_URL}/manga/${id}`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                },
            },
        );
        const data = await addBookmark.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in /api/bookmarks/delete:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
