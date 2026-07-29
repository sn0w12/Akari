import { JsonLd } from "@/components/json-ld";
import ErrorPage from "@/components/error-page";
import { GridSortSelect } from "@/components/grid/grid-sort";
import { MANGA_CARD_IMG_OPTS } from "@/components/manga/manga-card";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client } from "@/lib/api";
import { createJsonLd, createMetadata } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

const getPopularData = createServerFn({ method: "GET" })
    .validator(
        (d: { page: number; days: number; excludedGenres?: string[] }) => d,
    )
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET(
            "/v2/manga/list/popular",
            {
                params: {
                    query: {
                        page: data.page,
                        pageSize: 24,
                        days: data.days,
                        excludedGenres: data.excludedGenres ?? [],
                    },
                },
            },
        );
        return { data: result, error };
    });

export const Route = createFileRoute("/_default/popular/")({
    validateSearch: (
        search: Record<string, string | undefined>,
    ): { days?: number; page?: number } => {
        const page = Number(search.page);
        return {
            ...(search.days ? { days: Number(search.days) } : {}),
            ...(Number.isFinite(page) && page > 0 ? { page } : {}),
        };
    },
    loaderDeps: ({ search }) => ({
        days: Number(search.days) || 30,
        page: Number(search.page) || 1,
    }),
    loader: async ({ deps }) =>
        getPopularData({ data: { page: deps.page, days: deps.days } }),
    head: ({ loaderData }) => {
        const paginationData = loaderData?.data?.data;
        const page = paginationData?.currentPage ?? 1;
        const title =
            page === 1 ? "Popular Manga" : `Popular Manga - Page ${page}`;
        const canonicalPath = page === 1 ? "/popular" : `/popular?page=${page}`;
        const pagination: { previous?: string; next?: string } = {};
        if (page > 1) {
            pagination.previous =
                page === 2 ? "/popular" : `/popular?page=${page - 1}`;
        }
        if (paginationData && paginationData.totalPages > page) {
            pagination.next = `/popular?page=${page + 1}`;
        }
        const preloadImages = loaderData?.data?.data?.items?.slice(0, 4);

        return createMetadata({
            title,
            description: "Read the most popular manga for free on Akari.",
            canonicalPath,
            image: "/og/popular.webp",
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
    component: Popular,
});

function Popular() {
    const { data, error } = Route.useLoaderData();
    const { days = 30, page: currentPage = 1 } = Route.useSearch();

    const sorting = {
        currentSort: { key: "days", value: days ?? 30 },
        defaultSortValue: 30,
        sortItems: [
            { key: "days", value: 1, label: "Last 24 Hours" },
            { key: "separator" } as const,
            { key: "days", value: 7, label: "Last 7 Days" },
            { key: "days", value: 30, label: "Last 30 Days" },
            { key: "separator" } as const,
            { key: "days", value: 90, label: "Last 3 Months" },
            { key: "days", value: 180, label: "Last 6 Months" },
            { key: "separator" } as const,
            { key: "days", value: 365, label: "Last Year" },
        ],
    };

    if (error || !data) {
        return (
            <div className="flex-1 px-4 pt-2 pb-4">
                <ErrorPage error={error} />
            </div>
        );
    }

    const jsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: currentPage === 1 ? "/popular" : `/popular?page=${currentPage}`,
        name: "Popular",
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
                <h2 className="text-3xl font-semibold mb-2">Popular</h2>
                <div className="ml-auto">
                    <GridSortSelect sorting={sorting} />
                </div>
            </div>

            <JsonLd data={jsonLd} />
            <MangaGrid mangaList={data.data.items} priority={4} />
            <ServerPagination
                currentPage={data.data.currentPage}
                totalPages={data.data.totalPages}
                className="mt-4"
                href="/popular"
            />
        </div>
    );
}
