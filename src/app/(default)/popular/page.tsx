import { Metadata } from "next";
import PopularPage from "@/components/Popular";

interface PageProps {
    searchParams: Promise<{
        page: string;
    }>;
}

const description = `View all popular manga`;
export const metadata: Metadata = {
    title: "Popular Manga",
    description: description,
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: "Popular Manga",
        description: description,
    },
    twitter: {
        title: "Popular Manga",
        description: description,
    },
};

export default async function Home(props: PageProps) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PopularPage searchParams={searchParams} />
        </div>
    );
}
