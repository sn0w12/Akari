import { generateCacheHeaders } from "@/lib/cache";
import { processMangaList } from "@/lib/mangaNato";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const page: string = searchParams.get("page") || "1";

        // Construct the URL with the page number
        const url = `https://www.nelomanga.com/genre/all?page=${page}`;
        const result = await processMangaList(url, page);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(60),
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch latest manga" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
