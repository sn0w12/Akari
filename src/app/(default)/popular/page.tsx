import { Metadata } from "next";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";
import { cacheLife, cacheTag } from "next/cache";

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

const CACHE_TIMES: Record<
    string,
    { stale: number; revalidate: number; expire: number }
> = {
    "1": { stale: 60, revalidate: 60, expire: 120 }, // 1 minute
    "7": { stale: 600, revalidate: 1800, expire: 3600 }, // 10 minutes stale, 30 minutes revalidate, 1 hour expire
    "30": { stale: 1800, revalidate: 3600, expire: 7200 }, // 30 minutes stale, 1 hour revalidate, 2 hours expire
    "90": { stale: 3600, revalidate: 7200, expire: 14400 }, // 1 hour stale, 2 hours revalidate, 4 hours expire
    "180": { stale: 7200, revalidate: 14400, expire: 28800 }, // 2 hours stale, 4 hours revalidate, 8 hours expire
    "365": { stale: 14400, revalidate: 86400, expire: 604800 }, // 4 hours stale, 1 day revalidate, 1 week expire
};

const getPopularData = async (page: number, days: number = 30) => {
    "use cache";
    cacheLife(CACHE_TIMES[days.toString()]);
    cacheTag("popular");

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
};

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
