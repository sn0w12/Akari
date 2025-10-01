import { getLatestManga } from "@/lib/manga/scraping";
import { createApiHandler } from "@/lib/api/handler";

export const dynamic = "force-dynamic";

export const GET = createApiHandler(
    getLatestManga,
    { cacheTime: "1 minutes" },
    (req) => {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        return [page] as const;
    }
);
