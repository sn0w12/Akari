import { client } from "@/lib/api";
import { MangaGrid } from "../manga/manga-grid";
import { useQuery } from "@tanstack/react-query";

function getRecommendedManga(id: string) {
    return client.GET("/v2/manga/{id}/recommendations", {
        params: {
            path: {
                id,
            },
            query: {
                limit: 12,
            },
        },
    });
}

export function MangaRecommendations({ id }: { id: string }) {
    const { data, error } = useQuery({
        queryKey: ["manga-recommendations", id],
        queryFn: async () => {
            const { data, error } = await getRecommendedManga(id);
            if (error) throw error;
            return data.data;
        },
    });

    if (error) return null;
    if (!data || data.length === 0) {
        return <div className="text-center py-8">No recommendations found</div>;
    }

    return <MangaGrid mangaList={data} />;
}
