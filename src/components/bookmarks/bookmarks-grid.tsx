"use client";

import { useEffect, useState } from "react";
import { ServerPagination } from "../ui/pagination/server-pagination";
import { BookmarkCard } from "./cards/bookmark-card";

interface BookmarksGridProps {
    bookmarks: components["schemas"]["BookmarkListResponse"]["items"];
    page: number;
    totalPages: number;
}

export default function BookmarksGrid({
    bookmarks,
    page,
    totalPages,
}: BookmarksGridProps) {
    const [updatedBookmarks, setUpdatedBookmarks] =
        useState<components["schemas"]["BookmarkListResponse"]["items"]>(
            bookmarks,
        );

    useEffect(() => {
        setUpdatedBookmarks(bookmarks);
    }, [bookmarks]);

    return (
        <section>
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {updatedBookmarks.map((bookmark) => (
                    <div key={bookmark.bookmarkId}>
                        <BookmarkCard
                            bookmark={bookmark}
                            setUpdatedBookmarks={setUpdatedBookmarks}
                        />
                    </div>
                ))}
            </div>
            <ServerPagination
                currentPage={page}
                totalPages={totalPages}
                className="mt-4 mb-0"
            />
        </section>
    );
}
