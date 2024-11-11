"use client";

import { useState, useEffect } from "react";
import React from "react";
import db from "@/lib/db";
import { Bookmark, MangaCacheItem } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import { numberArraysEqual } from "@/lib/utils";

import BookmarksHeader from "./BookmarksHeader";
import BookmarksGrid from "./BookmarksGrid";

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
    const [allBookmarks, setAllBookmarks] = useState<MangaCacheItem[]>([]);
    const [workerFinished, setWorkerFinished] = useState(false);

    async function updateBookmark(bookmark: Bookmark) {
        const cacheObject = {
            name: bookmark.note_story_name,
            link: bookmark.link_story,
            last_chapter: bookmark.link_chapter_last.split("/").pop(),
            last_read: bookmark.link_chapter_now.split("/").pop(),
            bm_data: bookmark.bm_data,
            id: bookmark.storyid,
            image: bookmark.image,
            last_update: bookmark.chapterlastdateupdate,
        };
        const storyId = bookmark.link_story.split("/").pop();
        if (storyId) {
            db.updateCache(db.mangaCache, storyId, cacheObject);

            const cacheEntry = await db.getCache(db.hqMangaCache, storyId);
            if (!cacheEntry || cacheEntry.up_to_date === undefined) {
                await db.updateCache(db.hqMangaCache, storyId, {
                    up_to_date:
                        bookmark.link_chapter_last == bookmark.link_chapter_now,
                });
            }
        }
    }

    const fetchAllBookmarks = async (
        bookmarkFirstPage: Bookmark[],
        page: number,
    ) => {
        if (page !== 1) {
            const bookmarkCache = (await db.getAllCacheValues(
                db.mangaCache,
            )) as MangaCacheItem[];
            setAllBookmarks(bookmarkCache);
            setWorkerFinished(true);
            return;
        }

        const cachedFirstPage = (await db.getCache(
            db.bookmarkCache,
            "firstPage",
        )) as Bookmark[];

        // Check if the first page of bookmarks has changed
        if (
            cachedFirstPage &&
            cachedFirstPage.length > 0 &&
            bookmarkFirstPage.length > 0
        ) {
            const firstPageIds = bookmarkFirstPage.map((bookmark) =>
                Number(bookmark.storyid),
            );
            const cacheIds = cachedFirstPage.map((bookmark) =>
                Number(bookmark.storyid),
            );

            let matchFound = false;
            const len = firstPageIds.length;
            // Loop through the bookmarks and try matching smaller and smaller slices of the cache
            for (let i = 0; i < len; i++) {
                for (let j = len; j > 0; j--) {
                    if (j < 3) {
                        // Skip comparisons if the length of the slice is less than the minimum length
                        continue;
                    }
                    const bookmarkSlice = firstPageIds.slice(i, i + j);
                    const cacheSlice = cacheIds.slice(0, j);

                    if (numberArraysEqual(bookmarkSlice, cacheSlice)) {
                        console.log("Cache hit");
                        matchFound = true;
                        break;
                    }
                }
                if (matchFound) break;
            }

            if (matchFound) {
                const bookmarkCache = (await db.getAllCacheValues(
                    db.mangaCache,
                )) as MangaCacheItem[];

                // Update all bookmark items from bookmarkFirstPage in bookmarkCache
                for (const bookmark of bookmarkFirstPage) {
                    const cachedItemIndex = bookmarkCache.findIndex(
                        (item) => item.id === bookmark.storyid,
                    );
                    if (cachedItemIndex !== -1) {
                        updateBookmark(bookmark);
                    }
                }

                setAllBookmarks(bookmarkCache);
                setWorkerFinished(true);
                return;
            }
        }

        await db.setCache(db.bookmarkCache, "firstPage", bookmarkFirstPage);

        const bookmarkToast = new Toast("Processing bookmarks...", "info", {
            autoClose: false,
        });

        const allResponse = await fetch(`/api/bookmarks/all`);
        if (!allResponse.ok) {
            bookmarkToast.close();
            new Toast("Failed to fetch bookmarks.", "error");
        }
        const allData = await allResponse.json();

        allData.bookmarks.forEach((bookmark: Bookmark) => {
            updateBookmark(bookmark);
        });

        setAllBookmarks(allData.bookmarks);
        setWorkerFinished(true);
        new Toast("Bookmarks processed.", "success");
        bookmarkToast.close();
    };

    useEffect(() => {
        fetchAllBookmarks(bookmarks, page);
    }, []);

    return (
        <>
            <BookmarksHeader
                allBookmarks={allBookmarks}
                workerFinished={workerFinished}
            />
            <BookmarksGrid
                bookmarks={bookmarks}
                page={page}
                totalPages={Number(totalPages)}
            />
        </>
    );
}
