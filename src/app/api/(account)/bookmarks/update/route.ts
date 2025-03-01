import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { saveReadingHistoryEntry, userDataToUserId } from "@/lib/supabase";
import { BookmarkUpdateRequest } from "@/app/api/interfaces";

const BOOKMARK_UPDATE_URL = "https://user.mngusr.com/bookmark_update";

export async function POST(request: Request): Promise<Response> {
    try {
        const { chapter } = (await request.json()) as {
            chapter: BookmarkUpdateRequest;
        };
        const {
            chapterId,
            chapterTitle,
            mangaId,
            mangaTitle,
            image,
            storyData,
            chapterData,
        } = chapter;

        const cookieStore = await cookies();

        const canSaveMangaCookie = cookieStore.get(
            "save_reading_history",
        )?.value;
        let canSaveManga = canSaveMangaCookie === "true";
        if (canSaveMangaCookie === undefined) {
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

        if (!storyData || !chapterData) {
            return NextResponse.json(
                {
                    result: "error",
                    data: "Missing story_data, or chapter_data",
                },
                { status: 400 },
            );
        }

        const formData = new URLSearchParams();
        formData.append("user_data", user_data);
        formData.append("story_data", storyData);
        formData.append("chapter_data", chapterData);

        const [response, _] = await Promise.all([
            fetch(BOOKMARK_UPDATE_URL, {
                method: "POST",
                body: formData.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }),
            saveReadingHistoryEntry(userId, canSaveManga, {
                mangaId,
                mangaTitle,
                image,
                chapterId,
                chapterTitle,
            }).catch((err) => {
                // Log error but don't fail the request
                console.error(
                    "Failed to save reading history to database:",
                    err,
                );
                return null;
            }),
        ]);

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
