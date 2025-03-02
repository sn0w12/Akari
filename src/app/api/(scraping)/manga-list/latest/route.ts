import { generateCacheHeaders } from "@/lib/cache";
import { processMangaList } from "@/lib/mangaNato";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    clearPerformanceMetrics();
    time("Total API Request");
    try {
        const { searchParams } = new URL(req.url);
        const page: string = searchParams.get("page") || "1";

        time("Process Manga List");
        // Construct the URL with the page number
        const url = `https://www.nelomanga.com/genre/all?page=${page}&type=newest`;
        const result = await processMangaList(url, page);

        return new Response(
            JSON.stringify({
                ...result,
                performance: performanceMetrics,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    ...generateCacheHeaders(60),
                },
            },
        );
    } catch (error) {
        timeEnd("Total API Request");
        console.error(error);
        return new Response(
            JSON.stringify({
                error: "Failed to fetch latest manga",
                performance: performanceMetrics,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
