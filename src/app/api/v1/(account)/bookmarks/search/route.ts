import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { RawBookmark, searchUserBookmarks } from "@/lib/api/supabase/bookmarks";
import { SmallBookmarkRecord } from "@/types/manga";

export async function GET(request: Request): Promise<Response> {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get("q");

        if (!query || query.trim().length === 0) {
            return createApiErrorResponse(
                {
                    message:
                        "Query parameter 'q' is required and must not be empty",
                },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const username = getUsernameFromCookies(cookieStore);
        if (!username) {
            return createApiErrorResponse(
                { message: "User not logged in" },
                { status: 401 }
            );
        }

        const results: RawBookmark[] = await searchUserBookmarks(
            username,
            decodeURIComponent(query).trim()
        );

        const transformedResults: SmallBookmarkRecord[] = results.map(
            (bookmark) => ({
                mangaId: bookmark.manga_id,
                mangaName: bookmark.manga_name,
                mangaImage: bookmark.manga_image,
                latestChapter: bookmark.latest_chapter,
                last_read_at: bookmark.last_read_at,
                created_at: bookmark.created_at,
                updated_at: bookmark.updated_at,
            })
        );

        return createApiResponse(transformedResults, {
            cacheTime: "1 hours",
            isPrivate: true,
        });
    } catch (error) {
        return createApiErrorResponse(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}
