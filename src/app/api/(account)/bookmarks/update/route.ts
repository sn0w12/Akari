import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface BookmarkUpdateRequest {
    manga_id: string;
    chapter_id: string;
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { manga_id, chapter_id }: BookmarkUpdateRequest =
            await request.json();
        const cookieStore = await cookies();

        if (!manga_id || !chapter_id) {
            return NextResponse.json(
                {
                    result: "error",
                    data: "manga_id, and chapter_id are required",
                },
                { status: 400 },
            );
        }

        const newToken = await fetch(
            "https://www.nelomanga.com/user_auth/csrf_token",
            {
                method: "GET",
                headers: {
                    cookie: cookieStore.toString(),
                },
            },
        );
        const tokenData = await newToken.json();
        const formData = new URLSearchParams();
        formData.append("_token", tokenData._token);
        formData.append("comic_id", manga_id);
        formData.append("chapter_id", chapter_id);

        const response = await fetch(
            "https://www.nelomanga.com/action/add-history",
            {
                method: "POST",
                body: formData.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    cookie: cookieStore.toString(),
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    referer: `https://www.nelomanga.com/manga/${manga_id}/${chapter_id}`,
                    host: "www.nelomanga.com",
                    origin: "https://www.nelomanga.com",
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "x-requested-with": "XMLHttpRequest",
                },
            },
        );

        const data = await response.text();
        const result = JSON.parse(data);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in /api/bookmarks/update:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
