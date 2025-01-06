"use client";

import { useState, useEffect } from "react";
import React from "react";
import db from "@/lib/db";
import { Bookmark, MangaCacheItem } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import { numberArraysEqual } from "@/lib/utils";
import { getAllBookmarks } from "@/lib/bookmarks";

import BookmarksHeader from "./BookmarksHeader";
import BookmarksGrid from "./BookmarksGrid";

interface BookmarksBodyProps {
    bookmarks: Bookmark[];
    page: number;
    totalPages: number;
    error: string;
}

export default function BookmarksBody({
    bookmarks,
    page,
    totalPages,
    error = "",
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

    // Add this utility function at the top of file
    const generateBookmarksHash = (bookmarks: Bookmark[]): string => {
        return bookmarks
            .map((b) => `${b.storyid}:${b.chapter_numbernow}`)
            .sort()
            .join("|");
    };

    const calculateSimilarity = (
        currentHash: string,
        cachedHash: string,
    ): number => {
        const current = new Set(currentHash.split("|"));
        const cached = new Set(cachedHash.split("|"));
        const intersection = new Set([...current].filter((x) => cached.has(x)));
        return intersection.size / Math.max(current.size, cached.size);
    };

    async function isCacheValid(
        bookmarkFirstPage: Bookmark[],
        similarityThreshold: number = 0.6,
    ) {
        const cachedHash = (await db.getCache(
            db.bookmarkCache,
            "firstPageHash",
        )) as string;
        if (!cachedHash) return false;

        const currentHash = generateBookmarksHash(bookmarkFirstPage);
        const similarity = calculateSimilarity(currentHash, cachedHash);

        // Update cache with new hash
        await db.setCache(
            db.bookmarkCache,
            "firstPageHash",
            generateBookmarksHash(bookmarkFirstPage),
        );

        console.debug(`Cache similarity: ${similarity * 100}%`);
        return similarity >= similarityThreshold;
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

        // Handle empty bookmarks case
        if (bookmarkFirstPage.length === 0) {
            if (error) {
                new Toast(error, "error");
            } else {
                new Toast("No bookmarks found.", "info");
            }
            setAllBookmarks([]);
            setWorkerFinished(true);
            return;
        }

        if (await isCacheValid(bookmarkFirstPage)) {
            const bookmarkCache = (await db.getAllCacheValues(
                db.mangaCache,
            )) as MangaCacheItem[];

            // Update only first page items
            for (const bookmark of bookmarkFirstPage) {
                updateBookmark(bookmark);
            }

            setAllBookmarks(bookmarkCache);
            setWorkerFinished(true);
            return;
        }

        // Cache miss - fetch all bookmarks
        const bookmarkToast = new Toast("Processing bookmarks...", "info", {
            autoClose: false,
        });

        const allBookmarks = await getAllBookmarks();
        const mangaCache = allBookmarks.map((bookmark: Bookmark) => ({
            name: bookmark.note_story_name,
            link: bookmark.link_story,
            last_chapter: bookmark.link_chapter_last.split("/").pop() || "",
            last_read: bookmark.link_chapter_now.split("/").pop() || "",
            bm_data: bookmark.bm_data,
            id: bookmark.storyid,
            image: bookmark.image,
            last_update: bookmark.chapterlastdateupdate,
        }));

        allBookmarks.forEach((bookmark: Bookmark) => {
            updateBookmark(bookmark);
        });

        setAllBookmarks(mangaCache);
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
