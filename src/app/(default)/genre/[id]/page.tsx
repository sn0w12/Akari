import ErrorPage from "@/components/error-page";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import { STATIC_GENERATION_DISABLED } from "@/lib/api/pre-render";
import { genres } from "@/lib/api/search";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

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
    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
    const description = `View all ${name} manga`;

    return createMetadata({
        title: name,
        description: description,
        image: createOgImage("genre", params.id),
        canonicalPath: `/genre/${params.id}`,
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

    return (
        <>
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
