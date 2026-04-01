import { client, serverHeaders } from "@/lib/api";
import { createJsonLd } from "@/lib/seo";
import { cacheLife, cacheTag } from "next/cache";
import { CollectionPage } from "schema-dts";
import { ChaptersSection } from "./chapters-client";

export async function getMangaChapters(id: string) {
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

    const preferredScanlator =
        data.data.preferredScanlatorId ??
        data.data.chapters[0]?.scanlatorId ??
        1;

    const chapterListJsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: `/manga/${id}`,
        name: "Chapters",
        mainEntity: {
            "@type": "ItemList",
            url: `/manga/${id}`,
            numberOfItems: data.data.chapters.length,
            itemListElement: data.data.chapters.map((chapter, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `/manga/${id}/${chapter.scanlatorId}/${chapter.number}`,
            })),
        },
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(chapterListJsonLd).replace(
                        /</g,
                        "\\u003c",
                    ),
                }}
            />
            <ChaptersSection
                mangaId={id}
                chapters={data.data.chapters}
                preferredScanlator={preferredScanlator}
                scanlators={data.data.scanlators}
            />
        </>
    );
}
