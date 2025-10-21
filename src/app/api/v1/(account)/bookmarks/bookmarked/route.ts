import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mangaId = searchParams.get("id");

        if (!mangaId) {
            return createApiErrorResponse(
                { message: "Missing manga ID" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const username = getUsernameFromCookies(cookieStore);

        if (!username) {
            return createApiErrorResponse(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const bookmarkStatus = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/manga/status/${mangaId}`,
            {
                headers: {
                    cookie: cookieStore.toString(),
                },
            }
        );

        const data = await bookmarkStatus.json();
        const isBookmarked = data.data.isBookmarked === 1;
        const setCookieHeaders = bookmarkStatus.headers.getSetCookie();

        return createApiResponse(
            { isBookmarked },
            {
                cacheTime: "1 hours",
                isPrivate: true,
                setCookies: setCookieHeaders,
            }
        );
    } catch {
        return createApiErrorResponse(
            { message: "Invalid request" },
            { status: 400 }
        );
    }
}
