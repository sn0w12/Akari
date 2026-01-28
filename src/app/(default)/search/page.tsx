import SearchPage from "@/components/search";
import SearchPageSkeleton from "@/components/search/skeleton";
import { robots } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";

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
        <div className="flex-1">
            <Suspense fallback={<SearchPageSkeleton />}>
                <SearchPage />
            </Suspense>
        </div>
    );
}
