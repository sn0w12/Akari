import { fetchChapterData } from "@/lib/manga/scraping";
import { createApiHandler } from "@/lib/api/handler";

export const GET = createApiHandler(
    fetchChapterData,
    { cacheTime: "12 hours" },
    (req, params) =>
        [
            (params as { id: string; subId: string }).id,
            (params as { id: string; subId: string }).subId,
        ] as const
);
