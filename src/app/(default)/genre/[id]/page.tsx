import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getBaseUrl } from "@/lib/api/base-url";
import { robots } from "@/lib/utils";
import { client } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page: string;
        sort?: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    "use cache";
    cacheLife("weeks");

    const params = await props.params;
    const name = params.id.replaceAll("_", " ");
    const description = `View all ${name} manga`;
    const ogImage = `${getBaseUrl()}/og/categories/${params.id
        .toLowerCase()
        .replaceAll(" ", "_")}.webp`;

    return {
        title: name,
        description: description,
        robots: robots(),
        openGraph: {
            title: name,
            description: description,
            images: ogImage,
        },
        twitter: {
            title: name,
            description: description,
            images: ogImage,
        },
    };
}

export default async function GenrePage(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const { data, error } = await client.GET("/v2/genre/{name}", {
        params: {
            path: {
                name: params.id,
            },
            query: {
                page: Number(searchParams.page) || 1,
                pageSize: 24,
            },
        },
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <GridPage
            title={decodeURIComponent(params.id)}
            mangaList={data.data.items}
            currentPage={data.data.currentPage}
            totalPages={data.data.totalPages}
        />
    );
}
