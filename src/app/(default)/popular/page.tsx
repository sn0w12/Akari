import { Metadata } from "next";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";

interface PageProps {
    searchParams: Promise<{
        page: string;
    }>;
}

export const metadata: Metadata = createMetadata({
    title: "Akari Manga",
    description: "Read the most popular manga for free on Akari.",
    image: "/og/popular.webp",
    canonicalPath: "/popular",
});

export default async function Popular(props: PageProps) {
    const searchParams = await props.searchParams;
    const { data, error } = await client.GET("/v2/manga/list/popular", {
        params: {
            query: {
                offset: Number(searchParams.page) || 1,
                pageSize: 24,
                days: 30,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <GridPage
            title={"Popular"}
            mangaList={data.data.items}
            currentPage={data.data.currentPage}
            totalPages={data.data.totalPages}
        />
    );
}
