import { Metadata } from "next";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page: string;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
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
