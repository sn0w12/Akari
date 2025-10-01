import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";

export async function GET() {
    const cookieStore = await cookies();

    const username = getUsernameFromCookies(cookieStore);
    if (!username) {
        return createApiErrorResponse(
            { message: "User not logged in" },
            { status: 401 }
        );
    }

    try {
        const response = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/api/user/bookmark/count`,
            {
                method: "GET",
                headers: {
                    cookie: cookieStore.toString(),
                    referer: `https://${process.env.NEXT_MANGA_URL}`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                    origin: `${process.env.NEXT_MANGA_URL}`,
                },
            }
        );

        if (!response.ok) {
            console.error(
                `Failed to fetch bookmark list: ${response.statusText}`
            );
            return createApiErrorResponse(
                { message: response.statusText },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data.success) {
            return createApiErrorResponse(
                { message: response.statusText },
                { status: 500 }
            );
        }

        const unreadBookmarks = data.data;
        const setCookieHeaders = response.headers.getSetCookie();

        return createApiResponse(unreadBookmarks, {
            cacheTime: 300,
            isPrivate: true,
            setCookies: setCookieHeaders,
        });
    } catch (error) {
        return createApiErrorResponse(
            {
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
