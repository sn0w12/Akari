import { JsonLd } from "@/components/json-ld";
import ErrorPage from "@/components/error-page";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { Reader } from "@/components/manga-reader";
import { client, serverHeaders } from "@/lib/api";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createJsonLd, createMetadata, createOgImage } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { ComicSeries, ComicStory } from "schema-dts";

const loadChapter = createServerFn({ method: "GET" })
    .inputValidator((d: { id: string; subId: number; scanlator: number }) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET(
            "/v2/manga/{id}/{subId}",
            {
                params: {
                    path: { id: data.id, subId: data.subId },
                    query: { scanlatorId: data.scanlator },
                },
                headers: serverHeaders,
            },
        );
        if (error) return { data: null, error };
        return { data: result.data, error: null };
    });

export const Route = createFileRoute("/_default/manga/$mangaId/$scanlator/$subId/")({
    validateSearch: (
        search: Record<string, string | undefined>,
    ): { page?: string | number } => {
        const page = search.page;
        return typeof page === "string" || typeof page === "number"
            ? { page }
            : {};
    },
    loader: async ({ params }) =>
        loadChapter({
            data: {
                id: params.mangaId,
                subId: Number(params.subId),
                scanlator: Number(params.scanlator),
            },
        }),
    head: ({ loaderData, params }) => {
        const chapter = loaderData?.data;
        if (!chapter) {
            return createMetadata({
                title: "Chapter Not Found",
                description: "The requested chapter could not be found.",
                canonicalPath: `/manga/${params.mangaId}/${params.scanlator}/${params.subId}`,
            });
        }
        return createMetadata({
            title: `${chapter.mangaTitle} - ${chapter.title}`,
            description: `Read ${chapter.mangaTitle} ${chapter.title}.`,
            canonicalPath: `/manga/${chapter.mangaId}/${params.scanlator}/${params.subId}`,
            image: createOgImage("manga", chapter.mangaId),
            type: "article",
            pagination: {
                ...(chapter.lastChapter
                    ? {
                          previous: `/manga/${params.mangaId}/${params.scanlator}/${chapter.lastChapter}`,
                      }
                    : {}),
                ...(chapter.nextChapter
                    ? {
                          next: `/manga/${params.mangaId}/${params.scanlator}/${chapter.nextChapter}`,
                      }
                    : {}),
            },
            preloadImages: [
                {
                    src: chapter.images[0],
                    sizes: { default: "100vw" },
                    quality: 100,
                },
            ],
        });
    },
    component: MangaReaderPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ minutes: 60 })
            .staleWhileRevalidate({ hours: 4 })
            .public()
            .build(),
    }),
});

function MangaReaderPage() {
    const { data, error } = Route.useLoaderData();
    const { mangaId, scanlator, subId } = Route.useParams();

    return (
        <div className="bg-background text-foreground">
            <MangaReaderBody
                data={data}
                error={error}
                params={{ mangaId, scanlator, subId }}
            />
            <div className="p-4">
                <Suspense fallback={null}>
                    <MangaComments id={mangaId} target="chapter" />
                </Suspense>
            </div>
        </div>
    );
}

function MangaReaderBody({
    data,
    error,
    params,
}: {
    data: components["schemas"]["ChapterResponse"] | null;
    error: components["schemas"]["ErrorResponse"] | null;
    params: { mangaId: string; scanlator: string; subId: string };
}) {
    if (error || !data) {
        return <ErrorPage error={error ?? undefined} />;
    }

    const jsonLd = createJsonLd<ComicSeries>({
        "@type": "ComicSeries",
        url: `/manga/${data.mangaId}/${params.scanlator}/${data.number}`,
        name: data.mangaTitle,
        image: createOgImage("manga", data.mangaId),
        hasPart: data.chapters.map(
            (chapter: { value: string; label: string }) =>
                createJsonLd<ComicStory>({
                    "@type": "ComicStory",
                    url: `/manga/${data.mangaId}/${params.scanlator}/${chapter.value}`,
                    name: chapter.label,
                }),
        ),
    });

    return (
        <>
            <JsonLd data={jsonLd} />
            <Reader chapter={data} scanlator={params.scanlator} />
        </>
    );
}
