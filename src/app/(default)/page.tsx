import MangaReaderHome from "@/components/home";
import HomeSkeleton from "@/components/home/skeleton";
import { client } from "@/lib/api";
import { robots } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import ErrorPage from "@/components/error-page";

interface HomeProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export const metadata: Metadata = {
    title: "Akari Manga",
    description: "Read manga for free on Akari.",
    robots: robots(),
    openGraph: {
        title: "Akari Manga",
        description: "Read manga for free on Akari.",
        images: [
            {
                url: "https://raw.githubusercontent.com/sn0w12/Akari/refs/heads/master/images/AkariGradient.png",
                alt: "Akari Manga",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Akari",
        title: "Akari Manga",
        description: "Read manga for free on Akari.",
        images: {
            url: "https://raw.githubusercontent.com/sn0w12/Akari/refs/heads/master/images/AkariGradient.png",
            alt: "Akari Manga",
        },
    },
};

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
        }),
        client.GET("/v2/manga/list/popular", {
            params: {
                query: {
                    offset: 1,
                    pageSize: 24,
                    days: 30,
                },
            },
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
        <Suspense fallback={<HomeSkeleton currentPage={currentPage} />}>
            <MangaReaderHome
                latest={latestResponse.data.data.items}
                popular={popularResponse.data.data.items}
                totalPages={latestResponse.data.data.totalPages}
            />
        </Suspense>
    );
}
