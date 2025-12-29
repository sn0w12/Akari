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
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
    const description = `View all manga by ${name} on Akari for free.`;

    return createMetadata({
        title: name,
        description: description,
        image: createOgImage("author", params.id),
        canonicalPath: `/author/${params.id}`,
    });
}

async function getAuthor(name: string, page: number) {
    "use cache";
    cacheLife("hours");
    cacheTag("author-page");

    const { data, error } = await client.GET("/v2/author/{name}", {
        params: {
            path: {
                name,
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

export default async function AuthorPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const title = decodeURIComponent(params.id).replaceAll("-", " ");

    const page = parseInt(searchParams.page) || 1;
    const { data, error } = await getAuthor(title, page);

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
