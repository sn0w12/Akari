import ErrorPage from "@/components/error-page";
import { GridBodySkeleton } from "@/components/grid-page";
import {
    GridSortSelect,
    GridSortSelectFallback,
} from "@/components/grid/grid-sort";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { client, serverHeaders } from "@/lib/api";
import { genres } from "@/lib/api/search";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page: string;
        sort?: string;
    }>;
}

export async function generateStaticParams() {
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

async function getGenre(
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
        <div className="min-h-screen bg-background text-foreground mx-auto px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <Suspense fallback={<GenreHeaderFallback />}>
                    <GenreHeader {...props} />
                </Suspense>
            </div>

            <Suspense fallback={<GridBodySkeleton />}>
                <GenreBody {...props} />
            </Suspense>
        </div>
    );
}

async function GenreHeader(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const name = decodeURIComponent(params.id).replaceAll("-", " ");

    const sort =
        (searchParams.sort as components["schemas"]["MangaListSortOrder"]) ||
        "latest";

    const sorting = {
        currentSort: { key: "sort", value: sort },
        sortItems: [
            { key: "sort", value: "latest", label: "Latest" },
            { key: "sort", value: "popular", label: "Most Popular" },
        ],
        defaultSortValue: "latest",
    };

    return (
        <>
            <h2 className="text-3xl font-bold mb-2">{name}</h2>
            <div className="ml-auto">
                <GridSortSelect sorting={sorting} />
            </div>
        </>
    );
}

async function GenreHeaderFallback() {
    return (
        <>
            <Skeleton className="h-[36px] mb-2 w-96" />
            <div className="ml-auto">
                <GridSortSelectFallback />
            </div>
        </>
    );
}

async function GenreBody(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const name = decodeURIComponent(params.id).replaceAll("-", " ");

    const page = parseInt(searchParams.page) || 1;
    const sort =
        (searchParams.sort as components["schemas"]["MangaListSortOrder"]) ||
        "latest";
    const { data, error } = await getGenre(name, page, sort);

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <>
            <MangaGrid mangaList={data.data.items} />
            <ServerPagination
                currentPage={data.data.currentPage}
                totalPages={data.data.totalPages}
                className="mt-4"
            />
        </>
    );
}
