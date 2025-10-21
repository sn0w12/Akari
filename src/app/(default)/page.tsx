import MangaReaderHome from "@/components/home";
import HomeSkeleton from "@/components/home/skeleton";
import { robots } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";

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

    return (
        <Suspense fallback={<HomeSkeleton currentPage={currentPage} />}>
            <MangaReaderHome currentPage={currentPage} />
        </Suspense>
    );
}
