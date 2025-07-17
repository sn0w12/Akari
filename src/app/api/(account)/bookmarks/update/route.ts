import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReadingHistoryEntry } from "@/app/api/interfaces";

export async function POST(request: Request): Promise<Response> {
    try {
        const { chapter } = (await request.json()) as {
            chapter: ReadingHistoryEntry;
        };
        const { chapterId, mangaId } = chapter;

        const cookieStore = await cookies();

        if (!mangaId || !chapterId) {
            return NextResponse.json(
                {
                    result: "error",
                    data: "mangaId, and chapterId are required",
                },
                { status: 400 },
            );
        }

        const formData = new URLSearchParams();
        formData.append("comic_id", mangaId);
        formData.append("chapter_id", chapterId);

        const historyResponse = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/action/add-history`,
            {
                method: "POST",
                body: formData.toString(),
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    cookie: cookieStore.toString(),
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    referer: `https://${process.env.NEXT_MANGA_URL}/manga/${mangaId}/${chapterId}`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                    origin: `${process.env.NEXT_MANGA_URL}`,
                    accept: "*/*",
                    "x-requested-with": "XMLHttpRequest",
                },
            },
        );

        /*
        await saveReadingHistoryEntry(userId, canSaveManga, {
            mangaIdentifier,
            mangaTitle,
            image,
            chapterIdentifier,
            chapterTitle,
            mangaId,
            chapterId,
        }).catch((err) => {
            // Log error but don't fail the request
            console.error("Failed to save reading history to database:", err);
        });
        */

        const data = await historyResponse.text();
        const result = JSON.parse(data);
        const setCookieHeaders = historyResponse.headers.getSetCookie();
        const response = NextResponse.json(result);

        setCookieHeaders.forEach((cookie) => {
            response.headers.append("Set-Cookie", cookie);
        });

        return response;
    } catch (error) {
        console.error("Error in /api/bookmarks/update:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
