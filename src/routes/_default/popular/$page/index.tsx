import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import ErrorPage from "@/components/error-page";
import { GridSortSelect } from "@/components/grid/grid-sort";
import { MangaGrid } from "@/components/manga/manga-grid";
import { PageWrapper } from "@/components/page-wrapper";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import { createJsonLd, createMetadata } from "@/lib/seo";
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

const getPopularData = createServerFn({ method: "GET" })
    .inputValidator((d: { page: number; days: number; excludedGenres?: string[] }) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/manga/list/popular", {
            params: {
                query: {
                    page: data.page,
                    pageSize: 24,
                    days: data.days,
                    excludedGenres: data.excludedGenres ?? [],
                },
            },
            headers: serverHeaders,
        });
        return { data: result, error };
    });

export const Route = createFileRoute("/_default/popular/$page/")({
    validateSearch: (search: Record<string, string | undefined>) => ({
        days: search.days ?? "30",
    }),
    loaderDeps: ({ search }) => ({ days: Number(search.days) || 30 }),
    loader: async ({ params, deps }) => {
        const page = Number(params.page) || 1;
        return getPopularData({ data: { page, days: deps.days } });
    },
    head: ({ loaderData }) => {
        const page = loaderData?.data?.data?.currentPage ?? 1;
        const totalPages = loaderData?.data?.data?.totalPages;
        return createMetadata({
            title: `Popular Manga - Page ${page}`,
            description: "Read the most popular manga for free on Akari.",
            canonicalPath: `/popular/${page}`,
            image: "/og/popular.webp",
            pagination: {
                ...(page > 1 ? { previous: `/popular/${page - 1}` } : {}),
                ...(totalPages && page < totalPages ? { next: `/popular/${page + 1}` } : {}),
            },
        });
    },
    component: PopularPage,
});

function PopularPage() {
    const { data, error } = Route.useLoaderData();
    const { days } = Route.useSearch();
    const { page } = Route.useParams();
    const currentPage = Number(page) || 1;

    const sorting = {
        currentSort: { key: "days", value: days ?? "30" },
        defaultSortValue: "30",
        sortItems: [
            { key: "days", value: "1", label: "Last 24 Hours" },
            { key: "separator" } as const,
            { key: "days", value: "7", label: "Last 7 Days" },
            { key: "days", value: "30", label: "Last 30 Days" },
            { key: "separator" } as const,
            { key: "days", value: "90", label: "Last 3 Months" },
            { key: "days", value: "180", label: "Last 6 Months" },
            { key: "separator" } as const,
            { key: "days", value: "365", label: "Last Year" },
        ],
    };

    if (error || !data) {
        return (
            <PageWrapper>
                <div className="flex-1 px-4 pt-2 pb-4">
                    <ErrorPage error={error} />
                </div>
            </PageWrapper>
        );
    }

    const jsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: `/popular/${currentPage}`,
        name: "Popular",
        image: "/og/akari.webp",
        mainEntity: {
            "@type": "ItemList",
            itemListElement: data.data.items.map((item, index) =>
                createJsonLd<ListItem>({
                    "@type": "ListItem",
                    position: (currentPage - 1) * data.data.pageSize + index + 1,
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
        <PageWrapper>
            <div className="flex-1 px-4 pt-2 pb-4">
                <div className="flex gap-4">
                    <h2 className="text-3xl font-bold mb-2">Popular</h2>
                    <div className="ml-auto">
                        <GridSortSelect sorting={sorting} />
                    </div>
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
                    href="/popular"
                />
            </div>
        </PageWrapper>
    );
}
