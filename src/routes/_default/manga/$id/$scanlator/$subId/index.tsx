import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { Reader } from "@/components/manga-reader";
import { PageWrapper } from "@/components/page-wrapper";
import { client, serverHeaders } from "@/lib/api";
import { createJsonLd, createMetadata, createOgImage } from "@/lib/seo";
import { Suspense } from "react";
import { ComicSeries, ComicStory } from "schema-dts";
import ErrorPage from "@/components/error-page";

const loadChapter = createServerFn({ method: "GET" })
    .inputValidator((d: { id: string; subId: number; scanlator: number }) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/manga/{id}/{subId}", {
            params: {
                path: { id: data.id, subId: data.subId },
                query: { scanlatorId: data.scanlator },
            },
            headers: serverHeaders,
        });
        if (error) return { data: null, error };
        return { data: result.data, error: null };
    });

export const Route = createFileRoute("/_default/manga/$id/$scanlator/$subId/")({
    loader: async ({ params }) =>
        loadChapter({ data: { id: params.id, subId: Number(params.subId), scanlator: Number(params.scanlator) } }),
    head: ({ loaderData, params }) => {
        const chapter = loaderData?.data;
        if (!chapter) {
            return createMetadata({
                title: "Chapter Not Found",
                description: "The requested chapter could not be found.",
                canonicalPath: `/manga/${params.id}/${params.scanlator}/${params.subId}`,
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
                    ? { previous: `/manga/${params.id}/${params.scanlator}/${chapter.lastChapter}` }
                    : {}),
                ...(chapter.nextChapter
                    ? { next: `/manga/${params.id}/${params.scanlator}/${chapter.nextChapter}` }
                    : {}),
            },
        });
    },
    component: MangaReaderPage,
});

function MangaReaderPage() {
    const { data, error } = Route.useLoaderData();
    const { id, scanlator, subId } = Route.useParams();

    return (
        <PageWrapper>
            <div className="bg-background text-foreground">
                <MangaReaderBody data={data} error={error} params={{ id, scanlator, subId }} />
                <div className="p-4">
                    <Suspense fallback={null}>
                        <MangaComments id={id} target="chapter" />
                    </Suspense>
                </div>
            </div>
        </PageWrapper>
    );
}

function MangaReaderBody({ data, error, params }: { data: components["schemas"]["ChapterResponse"] | null; error: components["schemas"]["ErrorResponse"] | null; params: { id: string; scanlator: string; subId: string } }) {
    if (error || !data) {
        return <ErrorPage error={error ?? undefined} />;
    }

    const jsonLd = createJsonLd<ComicSeries>({
        "@type": "ComicSeries",
        url: `/manga/${data.mangaId}/${params.scanlator}/${data.number}`,
        name: data.mangaTitle,
        image: createOgImage("manga", data.mangaId),
        hasPart: data.chapters.map((chapter: { value: string; label: string }) =>
            createJsonLd<ComicStory>({
                "@type": "ComicStory",
                url: `/manga/${data.mangaId}/${params.scanlator}/${chapter.value}`,
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
            <Reader chapter={data} scanlator={params.scanlator} />
        </>
    );
}
