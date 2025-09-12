import { Metadata } from "next";
import PopularPage from "@/components/Popular";
import { getBaseUrl } from "@/app/api/baseUrl";
import { robots } from "@/lib/utils";

interface PageProps {
    searchParams: Promise<{
        page: string;
    }>;
}

const description = `View all popular manga`;
const ogImage = `${getBaseUrl()}/og/popular.webp`;
export const metadata: Metadata = {
    title: "Popular Manga",
    description: description,
    robots: robots(),
    openGraph: {
        title: "Popular Manga",
        description: description,
        images: ogImage,
    },
    twitter: {
        title: "Popular Manga",
        description: description,
        images: ogImage,
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
