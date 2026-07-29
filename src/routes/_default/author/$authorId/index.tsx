import { JsonLd } from "@/components/json-ld";
import ErrorPage from "@/components/error-page";
import { MANGA_CARD_IMG_OPTS } from "@/components/manga/manga-card";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client } from "@/lib/api";
import { createJsonLd, createMetadata, createOgImage } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Person } from "schema-dts";

const getAuthorData = createServerFn({ method: "GET" })
    .validator((d: { name: string; page: number }) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/author/{name}", {
            params: {
                path: { name: data.name },
                query: { page: data.page, pageSize: 24 },
            },
        });
        if (error) return { data: null, error };
        return { data: result, error: null };
    });

export const Route = createFileRoute("/_default/author/$authorId/")({
    validateSearch: (
        search: Record<string, string | undefined>,
    ): { page?: number } => {
        const page = Number(search.page);
        return Number.isFinite(page) && page > 0 ? { page } : {};
    },
    loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
    loader: async ({ params, deps }) => {
        const name = decodeURIComponent(params.authorId).replaceAll("-", " ");
        return getAuthorData({ data: { name, page: deps.page } });
    },
    head: ({ loaderData, params }) => {
        const name = decodeURIComponent(params.authorId).replaceAll("-", " ");
        const paginationData = loaderData?.data?.data;
        const page = paginationData?.currentPage ?? 1;
        const totalPages = paginationData?.totalPages;
        const canonicalPath =
            page === 1
                ? `/author/${params.authorId}`
                : `/author/${params.authorId}?page=${page}`;
        const pagination: { previous?: string; next?: string } = {};
        if (page > 1) {
            pagination.previous =
                page === 2
                    ? `/author/${params.authorId}`
                    : `/author/${params.authorId}?page=${page - 1}`;
        }
        if (totalPages && totalPages > page) {
            pagination.next = `/author/${params.authorId}?page=${page + 1}`;
        }
        const preloadImages = loaderData?.data?.data?.items?.slice(0, 4);

        return createMetadata({
            title: page === 1 ? name : `${name} - Page ${page}`,
            description: `Browse the full manga catalog by ${name} on Akari.`,
            canonicalPath,
            image: createOgImage("author", params.authorId),
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
    component: AuthorPage,
});

function AuthorPage() {
    const { data, error } = Route.useLoaderData();
    const { authorId } = Route.useParams();
    const title = decodeURIComponent(authorId).replaceAll("-", " ");

    if (error || !data) {
        return (
            <div className="flex-1 px-4 pt-2 pb-4">
                <ErrorPage error={error} />
            </div>
        );
    }

    const jsonLd = createJsonLd<Person>({
        "@type": "Person",
        url: `/author/${authorId}`,
        name: title,
        image: createOgImage("author", authorId),
        knowsAbout: ["Manga", "Comics"],
    });

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-semibold mb-2">{title}</h2>
            </div>

            <JsonLd data={jsonLd} />
            <MangaGrid mangaList={data.data.items} priority={4} />
            <ServerPagination
                currentPage={data.data.currentPage}
                totalPages={data.data.totalPages}
                className="mt-4"
                href={`/author/${authorId}`}
            />
        </div>
    );
}
