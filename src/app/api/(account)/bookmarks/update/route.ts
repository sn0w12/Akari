import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { saveReadingHistoryEntry, userDataToUserId } from "@/lib/supabase";
import { ReadingHistoryEntry } from "@/app/api/interfaces";
import { hasConsentFor } from "@/lib/cookies";

const BOOKMARK_UPDATE_URL = "https://user.mngusr.com/bookmark_update";

export async function POST(request: Request): Promise<Response> {
    try {
        const { chapter } = (await request.json()) as {
            chapter: ReadingHistoryEntry;
        };
        const { chapterId, chapterTitle, mangaId, mangaTitle, image } = chapter;

        const cookieStore = await cookies();

        const functionalConsent = hasConsentFor(cookieStore, "functional");
        const canSaveMangaCookie = cookieStore.get(
            "save_reading_history",
        )?.value;
        let canSaveManga = canSaveMangaCookie === "true";
        if (canSaveMangaCookie === undefined && functionalConsent) {
            canSaveManga = true;
        }

        const user_data = getUserData(cookieStore);
        const userId = userDataToUserId(user_data);

        if (!user_data || !userId) {
            return NextResponse.json(
                { result: "error", data: "User data is required" },
                { status: 401 },
            );
        }

        if (!mangaId || !chapterId) {
            return NextResponse.json(
                {
                    result: "error",
                    data: "mangaId, and chapterId are required",
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
        formData.append("comic_id", mangaId);
        formData.append("chapter_id", chapterId);

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
                    referer: `https://www.nelomanga.com/manga/${mangaId}/${chapterId}`,
                    host: "www.nelomanga.com",
                    origin: "https://www.nelomanga.com",
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "x-requested-with": "XMLHttpRequest",
                },
            },
        );

        /*
        await saveReadingHistoryEntry(userId, canSaveManga, {
            mangaId,
            mangaTitle,
            image,
            chapterId,
            chapterTitle,
        }).catch((err) => {
            // Log error but don't fail the request
            console.error("Failed to save reading history to database:", err);
            return null;
        });
        */

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
