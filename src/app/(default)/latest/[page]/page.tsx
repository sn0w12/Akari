import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import Page from "../page";

interface PageProps {
    params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
    return [{ page: "2" }];
}

export const metadata: Metadata = createMetadata({
    title: "Latest Releases",
    description: "Read the latest manga releases for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/latest",
});

export default async function LatestPage(props: PageProps) {
    return <Page {...props} />;
}
