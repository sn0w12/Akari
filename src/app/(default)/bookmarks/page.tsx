import BookmarksGrid from "@/components/bookmarks/bookmarks-grid";
import BookmarksHeader from "@/components/bookmarks/bookmarks-header";
import BookmarksSkeleton from "@/components/bookmarks/skeleton";
import { robots } from "@/lib/utils";
import type { Metadata } from "next";
import { Suspense } from "react";

export interface BookmarksProps {
    searchParams: Promise<{
        page: string;
    }>;
}

export const metadata: Metadata = {
    title: "Bookmarks",
    description: "View and manage your bookmarked series",
    robots: robots(),
};

export default async function Bookmarks(props: BookmarksProps) {
    return (
        <div className="h-full bg-background text-foreground">
            <div className="mx-auto p-4 h-full">
                <BookmarksHeader />
                <Suspense fallback={<BookmarksSkeleton />}>
                    <BookmarksGrid {...props} />
                </Suspense>
            </div>
        </div>
    );
}
