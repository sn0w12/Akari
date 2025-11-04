import MangaReaderHome from "@/components/home";
import HomeSkeleton from "@/components/home/skeleton";
import { client } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";
import ErrorPage from "@/components/error-page";
import { serverHeaders } from "@/lib/api";
import { cacheLife } from "next/cache";

interface HomeProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export const metadata: Metadata = createMetadata({
    title: "Home",
    description: "Read manga for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/",
});

async function getHomeData(currentPage: number) {
    "use cache";
    cacheLife("minutes");

    const [latestResponse, popularResponse] = await Promise.all([
        client.GET("/v2/manga/list", {
            params: {
                query: {
                    page: currentPage,
                    pageSize: 24,
                },
            },
            headers: serverHeaders,
        }),
        client.GET("/v2/manga/list/popular", {
            params: {
                query: {
                    offset: 1,
                    pageSize: 24,
                    days: 30,
                },
            },
            headers: serverHeaders,
        }),
    ]);

    return {
        latestData: latestResponse.data,
        latestError: latestResponse.error,
        popularData: popularResponse.data,
        popularError: popularResponse.error,
    };
}

export default async function Home(props: HomeProps) {
    const currentPage = Number((await props.searchParams).page) || 1;
    const { latestData, latestError, popularData, popularError } =
        await getHomeData(currentPage);

    if (latestError || !latestData) {
        return (
            <ErrorPage title="Failed to load manga list" error={latestError} />
        );
    }

    if (popularError || !popularData) {
        return (
            <ErrorPage
                title="Failed to load popular manga"
                error={popularError}
            />
        );
    }

    return (
        <Suspense fallback={<HomeSkeleton />}>
            <MangaReaderHome
                latest={latestData.data.items}
                popular={popularData.data.items}
                totalPages={latestData.data.totalPages}
            />
        </Suspense>
    );
}
