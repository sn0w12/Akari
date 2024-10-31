import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";

const BOOKMARK_NOTIFICATION_URL =
    "https://user.mngusr.com/bookmark_get_notification";

// API handler to check if a manga is bookmarked
export async function GET() {
    const cookieStore = cookies();
    const user_data = getUserData(cookieStore);

    if (!user_data) {
        return NextResponse.json(
            { message: "User data is required" },
            { status: 401 },
        );
    }

    try {
        const response = await fetch(BOOKMARK_NOTIFICATION_URL, {
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

        const unreadBookmarks = data.data;
        return NextResponse.json(unreadBookmarks);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: `Failed: ${error}` },
            { status: 500 },
        );
    }
}
