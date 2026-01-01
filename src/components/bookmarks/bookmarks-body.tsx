"use client";

import BookmarksHeader from "./bookmarks-header";
import BookmarksGrid from "./bookmarks-grid";
import { ButtonLink } from "../ui/button-link";

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
    if (bookmarks.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-lg text-muted-foreground">
                    No bookmarks yet.
                </p>
                <p className="text-sm text-muted-foreground">
                    Start reading and bookmark your favorite series!
                </p>
                <ButtonLink href="/" className="mt-1.5">
                    Browse Series
                </ButtonLink>
            </div>
        );
    }

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
