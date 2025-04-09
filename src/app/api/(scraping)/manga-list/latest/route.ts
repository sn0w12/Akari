import { generateCacheHeaders } from "@/lib/cache";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
} from "@/lib/utils";
import { getLatestManga } from "@/lib/scraping";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    clearPerformanceMetrics();
    time("Total API Request");
    try {
        const { searchParams } = new URL(req.url);
        const page: string = searchParams.get("page") || "1";

        time("Process Manga List");
        const result = await getLatestManga(page);
        timeEnd("Process Manga List");
        if ("error" in result) {
            throw new Error(result.error);
        }
        timeEnd("Total API Request");

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
