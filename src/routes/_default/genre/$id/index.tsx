import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import ErrorPage from "@/components/error-page";
import { MangaGrid } from "@/components/manga/manga-grid";
import { PageWrapper } from "@/components/page-wrapper";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import { createJsonLd, createMetadata, createOgImage } from "@/lib/seo";
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

const getGenreData = createServerFn({ method: "GET" })
    .inputValidator(
        (d: { name: string; page: number; sort?: "search" | "latest" | "popular" | "newest" }) => d,
    )
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/manga/list", {
            params: {
                query: {
                    genres: [data.name],
                    page: data.page,
                    pageSize: 24,
                    sortBy: data.sort ?? "latest",
                },
            },
            headers: serverHeaders,
        });
        if (error) return { data: null, error };
        return { data: result, error: null };
    });

export const Route = createFileRoute("/_default/genre/$id/")({
    validateSearch: (search: Record<string, string | undefined>) => ({
        page: Number(search.page) || 1,
        sort: (search.sort ?? "latest") as "search" | "latest" | "popular" | "newest" | undefined,
    }),
    loaderDeps: ({ search }) => ({ page: Number(search.page) || 1, sort: search.sort ?? "latest" as string }),
    loader: async ({ params, deps }) => {
        const name = decodeURIComponent(params.id).replaceAll("-", " ");
        return getGenreData({ data: { name, page: deps.page, sort: deps.sort as "search" | "latest" | "popular" | "newest" } });
    },
    head: ({ loaderData, params }) => {
        const name = decodeURIComponent(params.id).replaceAll("-", " ");
        const paginationData = loaderData?.data?.data;
        const page = paginationData?.currentPage ?? 1;
        const totalPages = paginationData?.totalPages;
        const canonicalPath = page === 1 ? `/genre/${params.id}` : `/genre/${params.id}?page=${page}`;
        const pagination: { previous?: string; next?: string } = {};
        if (page > 1) {
            pagination.previous = page === 2 ? `/genre/${params.id}` : `/genre/${params.id}?page=${page - 1}`;
        }
        if (totalPages && totalPages > page) {
            pagination.next = `/genre/${params.id}?page=${page + 1}`;
        }
        return createMetadata({
            title: page === 1 ? `${name} Manga` : `${name} Manga - Page ${page}`,
            description: `Browse manga in the ${name} genre on Akari.`,
            canonicalPath,
            image: createOgImage("genre", params.id),
            pagination: Object.keys(pagination).length > 0 ? pagination : undefined,
        });
    },
    component: GenrePage,
});

function GenrePage() {
    const { data, error } = Route.useLoaderData();
    const { id } = Route.useParams();
    const { page: currentPage } = Route.useSearch();
    const name = decodeURIComponent(id).replaceAll("-", " ");

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
        url: currentPage === 1 ? `/genre/${id}` : `/genre/${id}?page=${currentPage}`,
        name: name,
        image: createOgImage("genre", id),
        mainEntity: {
            "@type": "ItemList",
            itemListElement: data.data.items.map((item, index) =>
                createJsonLd<ListItem>({
                    "@type": "ListItem",
                    position: (data.data.currentPage - 1) * data.data.pageSize + index + 1,
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
                    <h2 className="text-3xl font-bold mb-2">{name}</h2>
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
                    href={`/genre/${id}`}
                />
            </div>
        </PageWrapper>
    );
}
