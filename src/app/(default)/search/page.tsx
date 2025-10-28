import SearchPage from "@/components/search";
import { Metadata } from "next";
import { robots } from "@/lib/utils";
import { Suspense } from "react";
import SearchPageSkeleton from "@/components/search/skeleton";

export const metadata: Metadata = {
    title: "Search Manga",
    description: "Search manga.",
    robots: robots(),
    openGraph: {
        title: "Search Manga",
        description: "Search manga.",
        images: [
            {
                url: "https://raw.githubusercontent.com/sn0w12/Akari/refs/heads/master/public/img/icon.png",
                width: 512,
                height: 512,
                alt: "Akari Manga",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Search Manga",
        description: "Search manga.",
        images: {
            url: "https://raw.githubusercontent.com/sn0w12/Akari/refs/heads/master/public/img/icon.png",
            width: 512,
            height: 512,
            alt: "Akari Manga",
        },
    },
};

export default async function Search() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<SearchPageSkeleton />}>
                <SearchPage />
            </Suspense>
        </div>
    );
}
