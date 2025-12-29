import { Metadata } from "next";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";
import { unstable_cache } from "next/cache";

interface PageProps {
    searchParams: Promise<{
        page: string;
        days: string;
    }>;
}

export const metadata: Metadata = createMetadata({
    title: "Akari Manga",
    description: "Read the most popular manga for free on Akari.",
    image: "/og/popular.webp",
    canonicalPath: "/popular",
});

const getPopularData = unstable_cache(
    async (page: number, days: number = 30) => {
        const { data, error } = await client.GET("/v2/manga/list/popular", {
            params: {
                query: {
                    page: page,
                    pageSize: 24,
                    days: days,
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
    const { page, days } = await props.searchParams;
    const { data, error } = await getPopularData(
        Number(page) || 1,
        Number(days) || 30
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
            sorting={{
                currentSort: { key: "days", value: days || "30" },
                defaultSortValue: "30",
                sortItems: [
                    { key: "days", value: "1", label: "Last 24 Hours" },
                    { key: "days", value: "7", label: "Last 7 Days" },
                    { key: "days", value: "30", label: "Last 30 Days" },
                    { key: "days", value: "90", label: "Last 3 Months" },
                    { key: "days", value: "180", label: "Last 6 Months" },
                    { key: "days", value: "365", label: "Last Year" },
                ],
            }}
        />
    );
}
