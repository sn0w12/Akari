import { fetchAuthorData } from "@/lib/manga/scraping";
import { createApiHandler } from "@/lib/api/handler";

export const dynamic = "force-dynamic";

export const GET = createApiHandler(
    fetchAuthorData,
    { cacheTime: "1 days" },
    (req, params) => {
        const { searchParams } = new URL(req.url);
        const id = (params as { id: string }).id;
        const page = searchParams.get("page") || "1";
        const orderBy = searchParams.get("orderBy") || "latest";
        return [id, page, orderBy] as const;
    }
);
