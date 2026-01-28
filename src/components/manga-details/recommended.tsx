import { client } from "@/lib/api";
import { cacheLife, cacheTag } from "next/cache";
import { MangaGrid } from "../manga/manga-grid";

async function getRecommendedManga(id: string) {
    "use cache";
    cacheLife("days");
    cacheTag(`manga-recommended-${id}`);

    const { data, error } = await client.GET("/v2/manga/{id}/recommendations", {
        params: {
            path: {
                id,
            },
            query: {
                limit: 12,
            },
        },
    });

    return { data, error };
}

export async function MangaRecommendations({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { data, error } = await getRecommendedManga(id);

    if (error || !data || data.data.length === 0) {
        return <div className="text-center py-8">No recommendations found</div>;
    }

    return <MangaGrid mangaList={data.data} />;
}
