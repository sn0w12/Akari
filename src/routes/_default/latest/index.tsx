import ErrorPage from "@/components/error-page";
import { MANGA_CARD_IMG_OPTS } from "@/components/manga/manga-card";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import { createJsonLd, createMetadata } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

const getLatestData = createServerFn({ method: "GET" })
    .inputValidator((d: { page: number }) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/manga/list", {
            params: { query: { page: data.page, pageSize: 24 } },
            headers: serverHeaders,
        });
        return { data: result, error };
    });

export const Route = createFileRoute("/_default/latest/")({
    validateSearch: (
        search: Record<string, string | undefined>,
    ): { page?: number } => {
        const page = Number(search.page);
        return Number.isFinite(page) && page > 0 ? { page } : {};
    },
    loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
    loader: async ({ deps }) => getLatestData({ data: { page: deps.page } }),
    head: ({ loaderData }) => {
        const paginationData = loaderData?.data?.data;
        const page = paginationData?.currentPage ?? 1;
        const title =
            page === 1 ? "Latest Releases" : `Latest Releases - Page ${page}`;
        const canonicalPath = page === 1 ? "/latest" : `/latest?page=${page}`;
        const pagination: { previous?: string; next?: string } = {};
        if (page > 1) {
            pagination.previous =
                page === 2 ? "/latest" : `/latest?page=${page - 1}`;
        }
        if (paginationData && paginationData.totalPages > page) {
            pagination.next = `/latest?page=${page + 1}`;
        }
        const preloadImages = loaderData?.data?.data?.items?.slice(0, 4);

        return createMetadata({
            title,
            description: "Read the latest manga releases for free on Akari.",
            canonicalPath,
            image: "/og/akari.webp",
            pagination:
                Object.keys(pagination).length > 0 ? pagination : undefined,
            preloadImages:
                preloadImages?.map((item) => ({
                    src: item.cover,
                    sizes: MANGA_CARD_IMG_OPTS.sizes,
                    quality: MANGA_CARD_IMG_OPTS.quality,
                })) ?? [],
        });
    },
    component: Latest,
});

function Latest() {
    const { data, error } = Route.useLoaderData();
    const { page: currentPage = 1 } = Route.useSearch();

    if (error || !data) {
        return (
            <div className="flex-1 px-4 pt-2 pb-4">
                <ErrorPage error={error} />
            </div>
        );
    }

    const jsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: currentPage === 1 ? "/latest" : `/latest?page=${currentPage}`,
        name: "Latest Releases",
        image: "/og/akari.webp",
        mainEntity: {
            "@type": "ItemList",
            itemListElement: data.data.items.map((item, index) =>
                createJsonLd<ListItem>({
                    "@type": "ListItem",
                    position:
                        (currentPage - 1) * data.data.pageSize + index + 1,
                    url: `/manga/${item.id}`,
                    item: createJsonLd<ComicSeries>({
                        "@type": "ComicSeries",
                        url: `/manga/${item.id}`,
                        name: item.title,
                        description: item.description,
                        image: item.cover,
                        genre: item.genres,
                        author: item.authors.map((author) => ({
                            "@type": "Person",
                            name: author,
                        })),
                        aggregateRating:
                            item.rating.average > 0
                                ? {
                                      "@type": "AggregateRating",
                                      ratingValue: item.rating.average,
                                      ratingCount: item.rating.total,
                                      bestRating: 10,
                                      worstRating: 0,
                                  }
                                : undefined,
                    }),
                }),
            ),
        },
    });

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />
            <MangaGrid mangaList={data.data.items} priority={4} />
            <ServerPagination
                currentPage={data.data.currentPage}
                totalPages={data.data.totalPages}
                className="mt-4"
                href="/latest"
            />
        </div>
    );
}
