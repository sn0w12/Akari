import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { generateCacheHeaders } from "@/lib/cache";

const BOOKMARK_LIST_URL = "https://user.mngusr.com/bookmark_get_list_idstory";

// Helper function to check multiple manga bookmarks
async function checkMangaBookmarks(user_data: string, mangaIds: string[]) {
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
            console.error(`API Error: ${data.data}`);
            return {};
        }

        const bookmarkedIds = new Set(data.data.split(","));
        const result: Record<string, boolean> = {};

        mangaIds.forEach((id) => {
            result[id] = bookmarkedIds.has(id);
        });

        return result;
    } catch (error) {
        console.error(error);
        return {};
    }
}

export async function POST(req: Request) {
    try {
        const { mangaIds } = await req.json();

        if (!Array.isArray(mangaIds)) {
            return NextResponse.json(
                { message: "mangaIds must be an array" },
                { status: 400 },
            );
        }

        const cookieStore = await cookies();
        const user_data = getUserData(cookieStore);

        if (!user_data) {
            return NextResponse.json(
                { message: "User data is required" },
                { status: 401 },
            );
        }

        const bookmarkStatuses = await checkMangaBookmarks(user_data, mangaIds);

        return NextResponse.json(
            { bookmarks: bookmarkStatuses },
            { status: 200, headers: { ...generateCacheHeaders(60) } },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Invalid request body" },
            { status: 400 },
        );
    }
}
