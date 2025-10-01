import { fetchSearchData } from "@/lib/manga/scraping";
import { createApiHandler } from "@/lib/api/handler";

export const GET = createApiHandler(
    fetchSearchData,
    { cacheTime: "1 hours" },
    (req) => {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");
        if (!query) throw new Error("Search query is required");
        const page = searchParams.get("p") || "1";
        return [query, page, "latest"] as const;
    }
);
