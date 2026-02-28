import { createMetadata } from "@/lib/seo";
import { Metadata } from "next";
import Page from "../page";

interface PageProps {
    params: Promise<{ page: string }>;
    searchParams: Promise<{
        days: string;
    }>;
}

export async function generateStaticParams() {
    return [{ page: "2" }];
}

export const metadata: Metadata = createMetadata({
    title: "Akari Manga",
    description: "Read the most popular manga for free on Akari.",
    image: "/og/popular.webp",
    canonicalPath: "/popular",
});

export default async function PopularPage(props: PageProps) {
    return <Page {...props} />;
}
