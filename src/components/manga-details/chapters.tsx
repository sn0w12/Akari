import { client, serverHeaders } from "@/lib/api";
import { cacheLife, cacheTag } from "next/cache";
import { ChaptersSection } from "./chapters-client";

async function getMangaChapters(id: string) {
    "use cache";
    cacheLife("quarterHour");
    cacheTag("manga-chapters", `manga-chapters-${id}`);

    const { data, error } = await client.GET("/v2/manga/{id}/chapters", {
        params: {
            path: {
                id,
            },
        },
        headers: serverHeaders,
    });

    return { data, error };
}

export async function ChaptersSectionServer({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { data, error } = await getMangaChapters(id);

    if (error || !data) {
        return <div className="text-center py-8">Failed to load chapters</div>;
    }

    return <ChaptersSection mangaId={id} chapters={data.data} />;
}
