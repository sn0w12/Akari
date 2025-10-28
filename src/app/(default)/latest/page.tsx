import MangaReaderHome from "@/components/home";
import HomeSkeleton from "@/components/home/skeleton";
import { client } from "@/lib/api";
import { robots } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";
import { serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";

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
