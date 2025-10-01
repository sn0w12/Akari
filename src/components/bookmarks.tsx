"use client";

import BookmarksBody from "./bookmarks/bookmarks-body";
import BookmarksSkeleton from "@/components/bookmarks/skeleton";
import { isApiErrorData } from "@/lib/api";
import { fetchBookmarks } from "@/lib/manga/bookmarks";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "./error-page";

interface BookmarksPageProps {
    page: number;
}

export default function BookmarksPage({ page }: BookmarksPageProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["bookmarks", page],
        queryFn: () => fetchBookmarks(page),
    });

    if (isApiErrorData(data)) {
        return (
            <div className="mx-auto p-4">
                <ErrorComponent message={data.message} />
            </div>
        );
    }

    if (isLoading || !data) {
        return <BookmarksSkeleton />;
    }

    return (
        <div className="mx-auto p-4">
            <BookmarksBody
                bookmarks={data.bookmarks}
                page={page}
                totalPages={data.totalPages}
            />
        </div>
    );
}
