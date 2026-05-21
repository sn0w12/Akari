import {
    MANGA_DETAILS_COVER_IMAGE_SIZES,
    MangaDetailsComponent,
} from "@/components/manga-details";
import { MangaDetailsBody } from "@/components/manga-details/body";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { client, serverHeaders } from "@/lib/api";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import {
    createImagePreloadLink,
    createMetadata,
    createOgImage,
} from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense } from "react";

const loadMangaPage = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data: id }) => {
        const [mangaRes, chaptersRes] = await Promise.all([
            client.GET("/v2/manga/{id}", {
                params: { path: { id } },
                headers: serverHeaders,
            }),
            client.GET("/v2/manga/{id}/chapters", {
                params: { path: { id } },
                headers: serverHeaders,
            }),
        ]);
        return {
            manga: mangaRes.data ?? null,
            chapters: chaptersRes.data ?? null,
            mangaError: mangaRes.error ?? null,
            chaptersError: chaptersRes.error ?? null,
        };
    });

export const Route = createFileRoute("/_default/manga/$id/")({
    loader: async ({ params }) => loadMangaPage({ data: params.id }),
    head: ({ loaderData, params }) => {
        const manga = loaderData?.manga?.data;
        if (!manga) {
            return createMetadata({
                title: "Manga Not Found",
                description: "The requested manga could not be found.",
                canonicalPath: `/manga/${params.id}`,
            });
        }
        const metadata = createMetadata({
            title: manga.title,
            description: manga.description ?? "",
            canonicalPath: `/manga/${manga.id}`,
            image: createOgImage("manga", manga.id),
            type: "book",
        });
        return {
            ...metadata,
            links: [
                ...(metadata.links ?? []),
                createImagePreloadLink({
                    src: manga.cover,
                    sizes: MANGA_DETAILS_COVER_IMAGE_SIZES,
                    quality: 60,
                }),
            ],
        };
    },
    component: MangaPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ minutes: 10 })
            .staleWhileRevalidate({ minutes: 30 })
            .public()
            .build(),
    }),
});

function MangaPage() {
    const { manga, chapters, mangaError } = Route.useLoaderData();
    const { id } = Route.useParams();

    if (mangaError) {
        return <div className="w-full p-4">Failed to load manga.</div>;
    }

    return (
        <div className="w-full p-4">
            {manga?.data && <MangaDetailsComponent manga={manga.data} />}
            {chapters?.data && (
                <MangaDetailsBody chapters={chapters.data} mangaId={id} />
            )}

            <Suspense fallback={null}>
                <MangaComments id={id} target="manga" />
            </Suspense>
        </div>
    );
}
