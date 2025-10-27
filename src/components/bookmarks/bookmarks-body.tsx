"use client";

import BookmarksHeader from "./bookmarks-header";
import BookmarksGrid from "./bookmarks-grid";

interface BookmarksBodyProps {
    bookmarks: components["schemas"]["BookmarkListResponse"]["items"];
    page: number;
    totalPages: number;
}

export default function BookmarksBody({
    bookmarks,
    page,
    totalPages,
}: BookmarksBodyProps) {
    return (
        <>
            <BookmarksHeader />
            <BookmarksGrid
                bookmarks={bookmarks}
                page={page}
                totalPages={Number(totalPages)}
            />
        </>
    );
}
