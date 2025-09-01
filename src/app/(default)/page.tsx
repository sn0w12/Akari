import MangaReaderHome from "@/components/Home";
import { Metadata } from "next";

interface HomeProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export const metadata: Metadata = {
    title: "Akari Manga",
    description: "Read manga for free on Akari.",
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
    const searchParams = await props.searchParams;
    return <MangaReaderHome searchParams={searchParams} />;
}
