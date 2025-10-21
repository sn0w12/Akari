import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { getUserBookmarks, RawBookmark } from "@/lib/api/supabase/bookmarks";
import { SmallBookmarkRecord, MalData } from "@/types/manga";

export async function GET() {
    const cookieStore = await cookies();
    const username = getUsernameFromCookies(cookieStore);
    if (!username) {
        return createApiErrorResponse(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const bookmarks = await getUserBookmarks(username);
        if (!bookmarks || bookmarks.length === 0) {
            return createApiResponse([], {
                cacheTime: "1 hours",
                isPrivate: true,
            });
        }

        const transformedBookmarks: (SmallBookmarkRecord & {
            malData: MalData | null;
        })[] = bookmarks.map(
            (bookmark: RawBookmark & { malData: MalData | null }) => ({
                mangaId: bookmark.manga_id,
                mangaName: bookmark.manga_name,
                mangaImage: bookmark.manga_image,
                latestChapter: bookmark.latest_chapter,
                last_read_at: bookmark.last_read_at,
                created_at: bookmark.created_at,
                updated_at: bookmark.updated_at,
                malData: bookmark.malData,
            })
        );

        return createApiResponse(transformedBookmarks, {
            cacheTime: "4 hours",
            isPrivate: true,
        });
    } catch (error) {
        return createApiErrorResponse(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
