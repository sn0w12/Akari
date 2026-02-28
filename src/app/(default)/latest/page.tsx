import ErrorPage from "@/components/error-page";
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
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

interface PageProps {
    params: Promise<{ page?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { page } = await props.params;
    const description = "Read the latest manga releases for free on Akari.";

    const { data } = await getLatestData(page ? parseInt(page) : 1);

    return createMetadata({
        title: "Latest Releases",
        description: description,
        image: "/og/akari.webp",
        canonicalPath: `/latest/${page ? page : "1"}`,
        pagination: {
            next: getNextPage(`latest`, data?.data),
            previous: getPreviousPage(`latest`, data?.data),
        },
    });
}

export const getLatestData = async (currentPage: number) => {
    "use cache";
    cacheLife("minutes");
    cacheTag("latest");

    const { data, error } = await client.GET("/v2/manga/list", {
        params: {
            query: {
                page: currentPage,
                pageSize: 24,
            },
        },
        headers: serverHeaders,
    });

    return { data, error };
};

export default async function Latest(props: PageProps) {
    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
            </div>

            <LatestBody {...props} />
        </div>
    );
}

async function LatestBody(props: PageProps) {
    const { page } = await props.params;
    const currentPage = Number(page) || 1;
    const { data, error } = await getLatestData(currentPage);

    if (error || !data) {
        return <ErrorPage error={error} />;
    }

    const jsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: `/latest/${currentPage}`,
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
                href="/latest"
            />
        </>
    );
}
