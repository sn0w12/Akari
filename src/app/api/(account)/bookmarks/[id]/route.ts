import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { generateCacheHeaders } from "@/lib/cache";

const BOOKMARK_LIST_URL = "https://user.mngusr.com/bookmark_get_list_idstory";

// Helper function to check if the manga is bookmarked
async function isMangaBookmarked(user_data: string, mangaId: string) {
    try {
        const response = await fetch(BOOKMARK_LIST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                user_data: user_data,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch bookmark list: ${response.statusText}`,
            );
        }

        const data = await response.json();

        if (data.result !== "ok") {
            throw new Error(`API Error: ${data.data}`);
        }

        const bookmarkedIds = data.data.split(","); // The list of bookmarked IDs
        return bookmarkedIds.includes(mangaId);
    } catch (error) {
        console.error(error);
        return false;
    }
}

// API handler to check if a manga is bookmarked
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;
    const { id: mangaId } = params;
    const cookieStore = await cookies();
    const user_data = getUserData(cookieStore);

    if (!user_data) {
        return NextResponse.json(
            { message: "User data is required" },
            { status: 401 },
        );
    }

    const isBookmarked = await isMangaBookmarked(user_data, mangaId);

    return NextResponse.json(
        { isBookmarked },
        { status: 200, headers: { ...generateCacheHeaders(60) } },
    );
}
