"use client";

import BookmarksBody from "./bookmarks/bookmarks-body";
import BookmarksSkeleton from "@/components/bookmarks/skeleton";
import { fetchBookmarks } from "@/lib/manga/bookmarks";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "./error-page";

interface BookmarksPageProps {
    page: number;
}

export default function BookmarksPage({ page }: BookmarksPageProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["bookmarks", page],
        queryFn: async () => await fetchBookmarks(page),
    });

    if (data?.result === "Error") {
        return <ErrorPage error={data} />;
    }

    if (isLoading || !data) {
        return <BookmarksSkeleton />;
    }

    return (
        <div className="mx-auto p-4">
            <BookmarksBody
                bookmarks={data.data.items}
                page={page}
                totalPages={data.data.totalPages}
            />
        </div>
    );
}
