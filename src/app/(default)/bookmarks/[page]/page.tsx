import { robots } from "@/lib/seo";
import { Metadata } from "next";
import Page from "../page";

interface PageProps {
    params: Promise<{ page: string }>;
}

export const metadata: Metadata = {
    title: "Bookmarks",
    description: "View and manage your bookmarked series",
    robots: robots(),
};

export default async function BookmarksPage(props: PageProps) {
    return <Page {...props} />;
}
