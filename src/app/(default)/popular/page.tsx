import { Metadata } from "next";
import PopularPage from "@/components/Popular";

interface PageProps {
    searchParams: Promise<{
        page: string;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const description = `View all popular manga`;

    return {
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
}

export default async function Home(props: PageProps) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PopularPage searchParams={searchParams} />
        </div>
    );
}
