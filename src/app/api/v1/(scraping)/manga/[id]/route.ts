import { fetchMangaDetails } from "@/lib/manga/scraping";
import { createApiHandler } from "@/lib/api/handler";

export const GET = createApiHandler(
    fetchMangaDetails,
    { cacheTime: "2 hours" },
    (req, params) => {
        const id = (params as { id: string }).id;
        const userAgent = req.headers.get("user-agent") || undefined;
        const acceptLanguage = req.headers.get("accept-language") || undefined;
        return [id, userAgent, acceptLanguage] as const;
    }
);
