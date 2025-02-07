import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import NodeCache from "node-cache";
import { generateClientCacheHeaders } from "@/lib/cache";

const cache = new NodeCache({ stdTTL: 5 * 60 }); // 5 minutes

const BOOKMARK_NOTIFICATION_URL =
    "https://user.mngusr.com/bookmark_get_notification";

// API handler to check if a manga is bookmarked
export async function GET() {
    const cookieStore = await cookies();
    const user_data = getUserData(cookieStore);

    if (!user_data) {
        return NextResponse.json(
            { message: "User data is required" },
            { status: 401 },
        );
    }

    const cacheKey = `bookmark_notification_${user_data}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateClientCacheHeaders(120),
            },
        });
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
            console.error(
                `Failed to fetch bookmark list: ${response.statusText}`,
            );
            return NextResponse.json(
                { message: `Failed: ${response.statusText}` },
                { status: 500 },
            );
        }

        const data = await response.json();

        if (data.result !== "ok") {
            console.error(`API Error: ${data.data}`);
            return NextResponse.json(
                { message: `Failed: ${response.statusText}` },
                { status: 500 },
            );
        }

        const unreadBookmarks = data.data;
        cache.set(cacheKey, unreadBookmarks);
        return NextResponse.json(unreadBookmarks, {
            headers: {
                "Content-Type": "application/json",
                ...generateClientCacheHeaders(120),
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: `Failed: ${error}` },
            { status: 500 },
        );
    }
}
