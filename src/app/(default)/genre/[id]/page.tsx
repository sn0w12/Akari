import ErrorPage from "@/components/error-page";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import { STATIC_GENERATION_DISABLED } from "@/lib/api/pre-render";
import { genres } from "@/lib/api/search";
import {
    createJsonLd,
    createMetadata,
    createOgImage,
    getNextPage,
    getPreviousPage,
} from "@/lib/seo";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CollectionPage, ComicSeries, ListItem } from "schema-dts";

interface PageProps {
    params: Promise<{ id: string; page?: string }>;
}

export async function generateStaticParams() {
    if (STATIC_GENERATION_DISABLED) {
        return [{ id: genres[0] }];
    }
    return genres.map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { id, page } = await props.params;
    const name = id.replaceAll("-", " ");
    const description = `View all ${name} manga`;

    const { data } = await getGenre(name, page ? parseInt(page) : 1);

    return createMetadata({
        title: name,
        description: description,
        image: createOgImage("genre", id),
        canonicalPath: `/genre/${id}`,
        pagination: {
            next: getNextPage(`genre/${id}`, data?.data),
            previous: getPreviousPage(`genre/${id}`, data?.data),
        },
    });
}

export async function getGenre(
    name: string,
    page: number,
    sort: components["schemas"]["MangaListSortOrder"] = "latest",
) {
    "use cache";
    cacheLife("minutes");
    cacheTag("genre", `genre-${name}`);

    const { data, error } = await client.GET("/v2/manga/list", {
        params: {
            query: {
                genres: [name],
                page: page,
                pageSize: 24,
                sortBy: sort,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

export default async function GenrePage(props: PageProps) {
    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <GenreHeader {...props} />
            </div>

            <GenreBody {...props} />
        </div>
    );
}

async function GenreHeader(props: PageProps) {
    const params = await props.params;
    const name = decodeURIComponent(params.id).replaceAll("-", " ");

    return <h2 className="text-3xl font-bold mb-2">{name}</h2>;
}

async function GenreBody(props: PageProps) {
    const params = await props.params;
    const name = decodeURIComponent(params.id).replaceAll("-", " ");

    const page = parseInt(params.page || "1");
    const { data, error } = await getGenre(name, page);

    if (error) {
        return <ErrorPage error={error} />;
    }

    const jsonLd = createJsonLd<CollectionPage>({
        "@type": "CollectionPage",
        url: `/genre/${params.id}`,
        name: name,
        image: createOgImage("genre", params.id),
        mainEntity: {
            "@type": "ItemList",
            itemListElement: data.data.items.map((item, index) =>
                createJsonLd<ListItem>({
                    "@type": "ListItem",
                    position: (page - 1) * data.data.pageSize + index + 1,
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
                href={`/genre/${params.id}`}
            />
        </>
    );
}
