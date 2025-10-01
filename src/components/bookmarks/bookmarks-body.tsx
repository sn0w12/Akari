"use client";

import { useEffect, useMemo, useRef } from "react";
import { Bookmark, SmallBookmark } from "@/types/manga";
import { getLatestReadChapter, fetchBookmarks } from "@/lib/manga/bookmarks";
import { fetchApi, isApiErrorData, isApiErrorResponse } from "@/lib/api";
import Toast from "@/lib/toast-wrapper";
import BookmarksHeader from "./bookmarks-header";
import BookmarksGrid from "./bookmarks-grid";

interface BookmarksBodyProps {
    bookmarks: Bookmark[];
    page: number;
    totalPages: number;
}

export default function BookmarksBody({
    bookmarks,
    page,
    totalPages,
}: BookmarksBodyProps) {
    const hasRunSync = useRef(false);
    const hasSyncedBookmarksCache = useMemo(
        () => localStorage.getItem("syncedBookmarks") === "true",
        []
    );

    const syncBookmarks = async () => {
        new Toast(
            "Syncing bookmarks to database, please don't close the page...",
            "info"
        );

        let currentPage = 1;
        let totalPages = 1;
        let hasError = false;

        while (currentPage <= totalPages) {
            const result = await fetchBookmarks(currentPage);
            if (isApiErrorData(result)) {
                console.error("Error fetching bookmarks:", result.message);
                hasError = true;
                break;
            }

            const smallBookmarks: SmallBookmark[] = result.bookmarks.map(
                (bookmark) => ({
                    mangaId: bookmark.slug,
                    mangaName: bookmark.title,
                    mangaImage: bookmark.coverImage,
                    latestChapter: bookmark.latestChapter.number.toString(),
                })
            );

            if (smallBookmarks.length > 0) {
                const response = await fetchApi(
                    "/api/v1/bookmarks/batch-update",
                    {
                        method: "POST",
                        body: JSON.stringify({ manga: smallBookmarks }),
                    }
                );

                if (isApiErrorResponse(response)) {
                    console.error(
                        "Error batch updating bookmarks:",
                        response.data.message
                    );
                    hasError = true;
                    break;
                }
            }

            totalPages = result.totalPages;
            currentPage++;
        }

        if (hasError) {
            new Toast("Failed to sync bookmarks", "error");
        } else {
            localStorage.setItem("syncedBookmarks", "true");
            new Toast("Bookmarks synced successfully!", "success");
        }
    };

    useEffect(() => {
        if (hasRunSync.current) return;
        hasRunSync.current = true;

        const syncIfNeeded = async () => {
            if (hasSyncedBookmarksCache) return;
            const mangaId = bookmarks.length > 0 ? bookmarks[0].slug : null;
            if (!mangaId) return;
            const latestRead = await getLatestReadChapter(mangaId);
            if (!latestRead) {
                await syncBookmarks();
            }
        };

        syncIfNeeded();
    }, [hasSyncedBookmarksCache, bookmarks]);

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
