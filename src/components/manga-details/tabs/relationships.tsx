import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { GRID_CLASS, GridBodySkeleton } from "@/components/grid-page";
import { MangaCard } from "@/components/manga/manga-card";

function getMangaRelationships(id: string) {
    return client.GET("/v2/manga/{id}/relationships", {
        params: {
            path: {
                id,
            },
        },
    });
}

export function MangaRelationships({ id }: { id: string }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ["manga-relationships", id],
        queryFn: async () => {
            const { data, error } = await getMangaRelationships(id);
            if (error) throw error;
            return data.data;
        },
    });

    if (error) return null;
    if (!data || data.length === 0) {
        return <div className="text-center py-8">No relationships found</div>;
    }
    if (isLoading) return <GridBodySkeleton pageSize={6} />;

    return (
        <div className={GRID_CLASS}>
            {data.map((relationship) => (
                <MangaCard
                    key={relationship.manga.id}
                    manga={relationship.manga}
                    badge={{ title: relationship.relationshipType }}
                />
            ))}
        </div>
    );
}
