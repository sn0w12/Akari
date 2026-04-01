import ErrorPage from "@/components/error-page";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { Reader } from "@/components/manga-reader";
import { client, serverHeaders } from "@/lib/api";
import {
    getAllChapterIds,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createJsonLd, createMetadata, createOgImage } from "@/lib/seo";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { ComicSeries, ComicStory } from "schema-dts";

const getChapter = async (id: string, subId: number, scanlator: number) => {
    "use cache";
    cacheLife("hours");
    cacheTag("manga-chapter", `manga-chapter-${id}-${subId}-${scanlator}`);

    const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
        params: {
            path: {
                id: id,
                subId: subId,
            },
            query: {
                scanlatorId: scanlator,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data: data.data, error: null };
};

interface MangaReaderProps {
    params: Promise<{ id: string; scanlator: string; subId: string }>;
}

export async function generateStaticParams() {
    if (STATIC_GENERATION_DISABLED) {
        return [
            {
                id: "737e7c9c-abac-4977-9c56-0a4ff26b295e",
                scanlator: "1",
                subId: "1",
            },
        ];
    }

    const mangaIds = await getAllChapterIds();
    return mangaIds.flatMap(({ mangaId, chapterIds }) =>
        chapterIds.map((chapterId) => ({
            id: mangaId,
            scanlator: "1",
            subId: chapterId.toString(),
        })),
    );
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    const mangaParams = await params;
    const { data, error } = await getChapter(
        mangaParams.id,
        Number(mangaParams.subId),
        Number(mangaParams.scanlator),
    );

    if (error) {
        return {
            title: "Chapter Not Found",
            description: "The requested chapter could not be found.",
        };
    }

    const chapter = data;
    const title = `${chapter.mangaTitle} - ${chapter.title}`;
    const description = `Read ${chapter.mangaTitle} ${chapter.title}.`;

    return createMetadata({
        title: title,
        description: description,
        image: createOgImage("manga", chapter.mangaId),
        canonicalPath: `/manga/${mangaParams.id}/${mangaParams.scanlator}/${mangaParams.subId}`,
        pagination: {
            next: `/manga/${mangaParams.id}/${mangaParams.scanlator}/${chapter.nextChapter}`,
            previous: `/manga/${mangaParams.id}/${mangaParams.scanlator}/${chapter.lastChapter}`,
        },
    });
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    return (
        <div className="bg-background text-foreground">
            <MangaReaderBody params={params} />
            <div className="p-4">
                <Suspense fallback={null}>
                    <MangaComments params={params} target="chapter" />
                </Suspense>
            </div>
        </div>
    );
}

async function MangaReaderBody({ params }: MangaReaderProps) {
    const mangaParams = await params;
    const { data, error } = await getChapter(
        mangaParams.id,
        Number(mangaParams.subId),
        Number(mangaParams.scanlator),
    );

    if (error) {
        return <ErrorPage error={error} />;
    }

    const jsonLd = createJsonLd<ComicSeries>({
        "@type": "ComicSeries",
        url: `/manga/${data.mangaId}/${mangaParams.scanlator}/${data.number}`,
        name: data.mangaTitle,
        image: createOgImage("manga", data.mangaId),
        hasPart: data.chapters.map((chapter) =>
            createJsonLd<ComicStory>({
                "@type": "ComicStory",
                url: `/manga/${data.mangaId}/${mangaParams.scanlator}/${chapter.value}`,
                name: chapter.label,
            }),
        ),
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />
            <Reader chapter={data} />
        </>
    );
}
