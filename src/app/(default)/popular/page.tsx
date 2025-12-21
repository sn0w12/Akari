import { Metadata } from "next";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";
import { unstable_cache } from "next/cache";

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

const getPopularData = unstable_cache(
    async (page: number) => {
        const { data, error } = await client.GET("/v2/manga/list/popular", {
            params: {
                query: {
                    page: page,
                    pageSize: 24,
                    days: 30,
                },
            },
            headers: serverHeaders,
        });

        return { data, error };
    },
    ["popular-data"],
    { revalidate: 1200, tags: ["popular"] }
);

export default async function Popular(props: PageProps) {
    const searchParams = await props.searchParams;
    const { data, error } = await getPopularData(
        Number(searchParams.page) || 1
    );

    if (error || !data) {
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
