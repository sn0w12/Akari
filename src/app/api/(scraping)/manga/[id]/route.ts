import { fetchMangaDetails } from "@/lib/scraping";
import { generateCacheHeaders } from "@/lib/cache";
import { performanceMetrics } from "@/lib/utils";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const id = params.id;
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";
    const acceptLanguage =
        req.headers.get("accept-language") || "en-US,en;q=0.9";

    const result = await fetchMangaDetails(id, userAgent, acceptLanguage);

    if ("error" in result) {
        return new Response(
            JSON.stringify({
                error: result.error,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    return new Response(
        JSON.stringify({
            data: result,
            performance: performanceMetrics,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(result.storyData ? 300 : 0, 10800),
            },
        },
    );
}
