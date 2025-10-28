import MangaReaderHome from "@/components/home";
import HomeSkeleton from "@/components/home/skeleton";
import { client } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";
import ErrorPage from "@/components/error-page";
import { serverHeaders } from "@/lib/api";

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

export default async function Home(props: HomeProps) {
    const currentPage = Number((await props.searchParams).page) || 1;

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

    if (latestResponse.error) {
        return (
            <ErrorPage
                title="Failed to load manga list"
                error={latestResponse.error}
            />
        );
    }

    if (popularResponse.error) {
        return (
            <ErrorPage
                title="Failed to load popular manga"
                error={popularResponse.error}
            />
        );
    }

    return (
        <Suspense fallback={<HomeSkeleton />}>
            <MangaReaderHome
                latest={latestResponse.data.data.items}
                popular={popularResponse.data.data.items}
                totalPages={latestResponse.data.data.totalPages}
            />
        </Suspense>
    );
}
