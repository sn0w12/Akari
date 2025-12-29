import { Metadata } from "next";
import { createMetadata, createOgImage } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";
import { cacheLife, cacheTag } from "next/cache";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page: string;
        sort?: string;
        [key: string]: string | string[] | undefined;
    }>;
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

async function getGenre(name: string, page: number) {
    "use cache";
    cacheLife("minutes");
    cacheTag("genre", `genre-${name}`);

    const { data, error } = await client.GET("/v2/genre/{name}", {
        params: {
            path: {
                name: name,
            },
            query: {
                page: page,
                pageSize: 24,
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
    const searchParams = await props.searchParams;
    const params = await props.params;
    const name = decodeURIComponent(params.id).replaceAll("-", " ");

    const page = parseInt(searchParams.page) || 1;
    const { data, error } = await getGenre(name, page);

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <GridPage
            title={name}
            mangaList={data.data.items}
            currentPage={data.data.currentPage}
            totalPages={data.data.totalPages}
        />
    );
}
