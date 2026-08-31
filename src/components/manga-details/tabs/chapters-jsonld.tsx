import { JsonLd } from "@/components/json-ld";
import { createJsonLd } from "@/lib/seo";
import { CollectionPage } from "schema-dts";
import type { components } from "@/types/api";

export function ChaptersJsonLd({
    chapters,
    mangaId,
}: {
    chapters: components["schemas"]["MangaChapterResponse"];
    mangaId: string;
}) {
    const chapterListJsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: `/manga/${mangaId}`,
        name: "Chapters",
        mainEntity: {
            "@type": "ItemList",
            url: `/manga/${mangaId}`,
            numberOfItems: chapters.chapters.length,
            itemListElement: chapters.chapters.map((chapter, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `/manga/${mangaId}/${chapter.scanlatorId}/${chapter.number}`,
            })),
        },
    });

    return <JsonLd data={chapterListJsonLd} />;
}
