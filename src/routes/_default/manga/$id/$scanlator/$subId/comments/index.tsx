import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import ErrorPage from "@/components/error-page";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { Skeleton } from "@/components/ui/skeleton";
import { client, serverHeaders } from "@/lib/api";
import { createMetadata, createOgImage } from "@/lib/seo";
import { generateSizes } from "@/lib/utils";
import { Suspense } from "react";
import { Link } from "@tanstack/react-router";

const loadManga = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/manga/{id}", {
            params: { path: { id: data } },
            headers: serverHeaders,
        });
        return { data: result, error };
    });

export const Route = createFileRoute("/_default/manga/$id/$scanlator/$subId/comments/")({
    loader: async ({ params }) => loadManga({ data: params.id }),
    head: ({ loaderData, params }) => {
        const mangaData = loaderData?.data?.data;
        const title = mangaData
            ? `${mangaData.title} - Chapter ${params.subId} Comments`
            : "Chapter Comments";
        return createMetadata({
            title,
            description: mangaData
                ? `Comments for ${mangaData.title} Chapter ${params.subId}.`
                : "Comments for this chapter.",
            canonicalPath: `/manga/${params.id}/${params.scanlator}/${params.subId}/comments`,
            image: mangaData ? createOgImage("manga", mangaData.id) : undefined,
        });
    },
    component: MangaReaderComments,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ minutes: 2 })
            .staleWhileRevalidate({ minutes: 10 })
            .public()
            .build(),
    }),
});

function MangaReaderComments() {
    const { data, error } = Route.useLoaderData();
    const { id, subId, scanlator } = Route.useParams();

    if (error) {
        return (
            <div className="bg-background text-foreground p-4">
                <ErrorPage error={error} />
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground p-4">
            <div className="flex flex-col gap-4">
                <Suspense fallback={<MangaCommentsHeaderSkeleton />}>
                    <MangaCommentsHeader mangaData={data?.data} chapterId={subId} />
                </Suspense>
                <Suspense fallback={null}>
                    <MangaComments id={id} target="chapter" />
                </Suspense>
            </div>
        </div>
    );
}

function MangaCommentsHeaderSkeleton() {
    return (
        <div className="flex flex-row gap-4 items-start bg-card rounded-lg p-4 border">
            <Skeleton className="rounded-lg object-cover w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1 gap-2">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
            </div>
        </div>
    );
}

function MangaCommentsHeader({ mangaData, chapterId }: { mangaData: components["schemas"]["MangaResponse"] | undefined; chapterId: string }) {
    if (!mangaData) {
        return null;
    }

    const manga = mangaData;
    return (
        <div className="flex flex-row gap-4 items-start bg-card rounded-lg p-4 border">
            <img
                src={manga.cover}
                alt={manga.title}
                className="rounded-lg object-cover w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0"
                width={150}
                height={200}
                sizes={generateSizes({
                    sm: "96px",
                    default: "128px",
                })}
            />
            <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold">{manga.title}</h1>
                <p className="text-sm text-muted-foreground">
                    Chapter {chapterId}
                </p>
                <Link
                    to={`/manga/$id/$scanlator/$subId`}
                    params={{ id: manga.id, scanlator: "1", subId: chapterId }}
                    className="text-sm text-primary hover:underline"
                >
                    Back to Chapter
                </Link>
            </div>
        </div>
    );
}
