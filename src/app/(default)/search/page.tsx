import SimpleSearch from "@/components/SimpleSearch";
import { Metadata } from "next";
import { robots } from "@/lib/utils";

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

export default async function SearchPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <SimpleSearch />
        </div>
    );
}
