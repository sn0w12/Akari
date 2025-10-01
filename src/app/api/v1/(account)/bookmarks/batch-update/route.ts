import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { saveBookmarksBatch } from "@/lib/api/supabase/bookmarks";
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
        const { manga } = await (request.json() as Promise<{
            manga: SmallBookmark[];
        }>);

        if (!manga || !Array.isArray(manga) || manga.length === 0) {
            return createApiErrorResponse(
                {
                    message: "mangas array is required and must not be empty",
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

        // Validate all manga objects
        const validationResults = manga.map((manga) =>
            smallBookmarkSchema.safeParse(manga)
        );

        const invalidIndices = validationResults
            .map((result, index) => ({ result, index }))
            .filter(({ result }) => !result.success)
            .map(({ index }) => index);

        if (invalidIndices.length > 0) {
            return createApiErrorResponse(
                {
                    message: `Invalid manga data at indices: ${invalidIndices.join(
                        ", "
                    )}`,
                    details: invalidIndices.map((index) => ({
                        index,
                        errors: validationResults[index].error?.issues || [],
                    })),
                },
                { status: 400 }
            );
        }

        const results = await saveBookmarksBatch(username, manga);

        return createApiResponse(results);
    } catch (error) {
        return createApiErrorResponse(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}
