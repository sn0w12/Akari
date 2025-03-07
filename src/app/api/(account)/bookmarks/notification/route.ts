import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateClientCacheHeaders } from "@/lib/cache";

// API handler to check if a manga is bookmarked
export async function GET() {
    const cookieStore = await cookies();

    try {
        const response = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/api/user/bookmark/count`,
            {
                method: "GET",
                headers: {
                    cookie: cookieStore.toString(),
                },
            },
        );

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

        if (!data.success) {
            console.error(`API Error: ${data.data}`);
            return NextResponse.json(
                { message: `Failed: ${response.statusText}` },
                { status: 500 },
            );
        }

        const unreadBookmarks = data.data;
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
