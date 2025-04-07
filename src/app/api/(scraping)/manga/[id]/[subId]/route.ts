import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateCacheHeaders } from "@/lib/cache";
import { hasConsentFor } from "@/lib/cookies";
import { performanceMetrics } from "@/lib/utils";
import { fetchChapterData } from "@/lib/scraping";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string; subId: string }> },
): Promise<Response> {
    const params = await props.params;
    const { id, subId } = params;
    const cookieStore = await cookies();
    const server = cookieStore.get(`manga_server`)?.value || "1";

    try {
        const chapterData = await fetchChapterData(id, subId, server);

        if ("result" in chapterData) {
            return NextResponse.json(
                {
                    ...chapterData,
                    performance: performanceMetrics,
                },
                { status: 500 },
            );
        }

        const mangaResponse = NextResponse.json(chapterData, {
            status: 200,
            headers: {
                contentType: "application/json",
                ...generateCacheHeaders(3600, 604800, 2592000),
            },
        });

        if (hasConsentFor(cookieStore, "functional")) {
            mangaResponse.cookies.set("manga_server", server, {
                maxAge: 31536000,
                path: "/",
            });
        }

        return mangaResponse;
    } catch (error: unknown) {
        return NextResponse.json(
            {
                result: "error",
                data:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch chapter data",
                performance: performanceMetrics,
            },
            { status: 500 },
        );
    }
}
