import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import ErrorPage from "@/components/error-page";
import { MangaGrid } from "@/components/manga/manga-grid";
import { PageWrapper } from "@/components/page-wrapper";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import { createJsonLd, createMetadata, createOgImage } from "@/lib/seo";
import { Person } from "schema-dts";

const getAuthorData = createServerFn({ method: "GET" })
    .inputValidator((d: { name: string; page: number }) => d)
    .handler(async ({ data }) => {
        const { data: result, error } = await client.GET("/v2/author/{name}", {
            params: {
                path: { name: data.name },
                query: { page: data.page, pageSize: 24 },
            },
            headers: serverHeaders,
        });
        if (error) return { data: null, error };
        return { data: result, error: null };
    });

export const Route = createFileRoute("/_default/author/$id/")({
    loader: async ({ params }) => {
        const name = decodeURIComponent(params.id).replaceAll("-", " ");
        return getAuthorData({ data: { name, page: 1 } });
    },
    head: ({ loaderData, params }) => {
        const name = decodeURIComponent(params.id).replaceAll("-", " ");
        const paginationData = loaderData?.data?.data;
        return createMetadata({
            title: name,
            description: `Browse the full manga catalog by ${name} on Akari.`,
            canonicalPath: `/author/${params.id}`,
            image: createOgImage("author", params.id),
            pagination:
                paginationData && paginationData.totalPages > 1
                    ? { next: `/author/${params.id}/2` }
                    : undefined,
        });
    },
    component: AuthorPage,
});

function AuthorPage() {
    const { data, error } = Route.useLoaderData();
    const { id } = Route.useParams();
    const title = decodeURIComponent(id).replaceAll("-", " ");

    if (error || !data) {
        return (
            <PageWrapper>
                <div className="flex-1 px-4 pt-2 pb-4">
                    <ErrorPage error={error} />
                </div>
            </PageWrapper>
        );
    }

    const jsonLd = createJsonLd<Person>({
        "@type": "Person",
        url: `/author/${id}`,
        name: title,
        image: createOgImage("author", id),
        knowsAbout: ["Manga", "Comics"],
    });

    return (
        <PageWrapper>
            <div className="flex-1 px-4 pt-2 pb-4">
                <div className="flex gap-4">
                    <h2 className="text-3xl font-bold mb-2">{title}</h2>
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
                    href={`/author/${id}`}
                />
            </div>
        </PageWrapper>
    );
}
