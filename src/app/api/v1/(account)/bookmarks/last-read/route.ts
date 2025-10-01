import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { getMangaBookmark, RawBookmark } from "@/lib/api/supabase/bookmarks";
import { SmallBookmarkRecord } from "@/types/manga";

export async function GET(req: Request) {
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
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const bookmark = (await getMangaBookmark(
            username,
            mangaId
        )) as RawBookmark | null;
        if (!bookmark) {
            return createApiResponse(null, {
                cacheTime: "1 hours",
                isPrivate: true,
            });
        }
        const transformedBookmark: SmallBookmarkRecord = {
            mangaId: bookmark.manga_id,
            mangaName: bookmark.manga_name,
            mangaImage: bookmark.manga_image,
            latestChapter: bookmark.latest_chapter,
            last_read_at: bookmark.last_read_at,
            created_at: bookmark.created_at,
            updated_at: bookmark.updated_at,
        };

        return createApiResponse(transformedBookmark, {
            cacheTime: "1 hours",
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
