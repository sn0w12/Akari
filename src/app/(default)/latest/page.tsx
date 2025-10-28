import { client } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";

interface HomeProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export const metadata: Metadata = createMetadata({
    title: "Latest Releases",
    description: "Read the latest manga releases for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/latest",
});

export default async function Home(props: HomeProps) {
    const currentPage = Number((await props.searchParams).page) || 1;

    const { data, error } = await client.GET("/v2/manga/list", {
        params: {
            query: {
                page: currentPage,
                pageSize: 24,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage title="Failed to load manga list" error={error} />;
    }

    return (
        <GridPage
            title="Latest Releases"
            mangaList={data.data.items}
            currentPage={currentPage}
            totalPages={data.data.totalPages}
        />
    );
}
