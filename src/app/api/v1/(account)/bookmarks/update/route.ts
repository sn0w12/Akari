import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { saveBookmark } from "@/lib/api/supabase/bookmarks";
import { SmallBookmark } from "@/types/manga";
import { z } from "zod";

const smallBookmarkSchema = z.object({
    mangaId: z.string().min(1),
    mangaName: z.string().min(1),
    mangaImage: z.string().min(1).nullable(),
    latestChapter: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
    try {
        const { chapterId, mangaId, manga } = await (request.json() as Promise<{
            chapterId: string;
            mangaId: string;
            manga: SmallBookmark;
        }>);

        if (!mangaId || !chapterId) {
            return createApiErrorResponse(
                {
                    message: "mangaId and chapterId are required",
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

        const formData = new URLSearchParams();
        formData.append("comic_id", mangaId);
        formData.append("chapter_id", chapterId);

        const historyResponse = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/action/add-history`,
            {
                method: "POST",
                body: formData.toString(),
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    cookie: cookieStore.toString(),
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    referer: `https://${process.env.NEXT_MANGA_URL}/manga/${mangaId}/${chapterId}`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                    origin: `${process.env.NEXT_MANGA_URL}`,
                    accept: "*/*",
                    "x-requested-with": "XMLHttpRequest",
                },
            }
        );

        const result = await historyResponse.json();
        if (result.success) {
            const validationResult = smallBookmarkSchema.safeParse(manga);
            if (validationResult.success) {
                saveBookmark(username, manga);
            }
        }
        const setCookieHeaders = historyResponse.headers.getSetCookie();

        return createApiResponse(result, {
            setCookies: setCookieHeaders,
        });
    } catch (error) {
        return createApiErrorResponse(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}
