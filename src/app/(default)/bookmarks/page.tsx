import type { Metadata } from "next";
import { robots } from "@/lib/utils";
import BookmarksPage from "@/components/Bookmarks";

interface BookmarksProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export const metadata: Metadata = {
    title: "Bookmarks",
    description: "View and manage your bookmarked series",
    robots: robots(),
};

export default async function Bookmarks(props: BookmarksProps) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <BookmarksPage page={Number(searchParams.page) || 1} />
        </div>
    );
}
