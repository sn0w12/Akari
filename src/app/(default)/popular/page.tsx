import ErrorPage from "@/components/error-page";
import { GridBodySkeleton } from "@/components/grid-page";
import {
    GridSortSelect,
    GridSortSelectFallback,
} from "@/components/grid/grid-sort";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import {
    createJsonLd,
    createMetadata,
    getNextPage,
    getPreviousPage,
} from "@/lib/seo";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

interface PageProps {
    params: Promise<{ page?: string }>;
    searchParams: Promise<{
        days: string;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { page } = await props.params;
    const { days } = await props.searchParams;
    const description = "Read the most popular manga for free on Akari.";

    const { data } = await getPopularData(
        page ? parseInt(page) : 1,
        days ? parseInt(days) : 30,
    );

    return createMetadata({
        title: "Popular Manga",
        description: description,
        image: "/og/popular.webp",
        canonicalPath: `/popular/${page ? page : "1"}`,
        pagination: {
            next: getNextPage(`popular`, data?.data),
            previous: getPreviousPage(`popular`, data?.data),
        },
    });
}

const CACHE_TIMES: Record<
    string,
    { stale: number; revalidate: number; expire: number }
> = {
    "1": { stale: 60, revalidate: 60, expire: 120 }, // 1 minute
    "7": { stale: 600, revalidate: 1800, expire: 3600 }, // 10 minutes stale, 30 minutes revalidate, 1 hour expire
    "30": { stale: 1800, revalidate: 3600, expire: 7200 }, // 30 minutes stale, 1 hour revalidate, 2 hours expire
    "90": { stale: 3600, revalidate: 7200, expire: 14400 }, // 1 hour stale, 2 hours revalidate, 4 hours expire
    "180": { stale: 7200, revalidate: 14400, expire: 28800 }, // 2 hours stale, 4 hours revalidate, 8 hours expire
    "365": { stale: 14400, revalidate: 86400, expire: 604800 }, // 4 hours stale, 1 day revalidate, 1 week expire
};

export const getPopularData = async (page: number, days: number = 30) => {
    "use cache";
    cacheLife(CACHE_TIMES[days.toString()]);
    cacheTag("popular");

    const { data, error } = await client.GET("/v2/manga/list/popular", {
        params: {
            query: {
                page: page,
                pageSize: 24,
                days: days,
            },
        },
        headers: serverHeaders,
    });

    return { data, error };
};

export default async function Popular(props: PageProps) {
    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">Popular</h2>
                <div className="ml-auto">
                    <Suspense fallback={<GridSortSelectFallback />}>
                        <PopularSorting {...props} />
                    </Suspense>
                </div>
            </div>

            <Suspense fallback={<GridBodySkeleton />}>
                <PopularBody {...props} />
            </Suspense>
        </div>
    );
}

async function PopularSorting(props: PageProps) {
    const { days } = await props.searchParams;
    const sorting = {
        currentSort: { key: "days", value: days || "30" },
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

    return <GridSortSelect sorting={sorting} />;
}

async function PopularBody(props: PageProps) {
    const { page } = await props.params;
    const { days } = await props.searchParams;

    const currentPage = Number(page) || 1;

    const { data, error } = await getPopularData(
        currentPage,
        Number(days) || 30,
    );

    if (error || !data) {
        return <ErrorPage error={error} />;
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
        <>
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
        </>
    );
}
