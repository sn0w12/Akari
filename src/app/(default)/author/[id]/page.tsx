import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";
import { getAllAuthors } from "@/lib/api/pre-render";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page: string;
    }>;
}

export async function generateStaticParams(): Promise<
    { params: { id: string } }[]
> {
    if (!process.env.API_KEY || process.env.DISABLE_STATIC_GENERATION === "1")
        return [];
    const authors = await getAllAuthors();

    return authors.map((author) => ({
        params: { id: author },
    }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    "use cache";
    cacheLife("weeks");

    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
    const description = `View all manga by ${name} on Akari for free.`;

    return createMetadata({
        title: name,
        description: description,
        image: `/api/v1/author/${params.id}/og`,
        canonicalPath: `/author/${params.id}`,
    });
}

export default async function AuthorPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const title = decodeURIComponent(params.id).replaceAll("-", " ");

    const { data, error } = await client.GET("/v2/author/{name}", {
        params: {
            path: {
                name: title,
            },
            query: {
                page: Number(searchParams.page) || 1,
                pageSize: 24,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <GridPage
            title={title}
            mangaList={data.data.items}
            currentPage={data.data.currentPage}
            totalPages={data.data.totalPages}
        />
    );
}
