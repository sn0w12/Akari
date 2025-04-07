"use client";

import { useEffect, useState } from "react";
import React from "react";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { Bookmark } from "@/app/api/interfaces";
import DesktopBookmarkCard from "./Cards/DesktopBookmarkCard";
import MobileBookmarkCard from "./Cards/MobileBookmarkCard";
import { getHqImage } from "@/lib/utils";
import db from "@/lib/db";

interface BookmarksGridProps {
    bookmarks: Bookmark[];
    page: number;
    totalPages: number;
}

export default function BookmarksGrid({
    bookmarks,
    page,
    totalPages,
}: BookmarksGridProps) {
    const [updatedBookmarks, setUpdatedBookmarks] = useState<Bookmark[]>([]);

    const updateBookmarks = async (bookmarks: Bookmark[]) => {
        await Promise.all(
            bookmarks.map(async (bookmark: Bookmark) => {
                const id = bookmark.link_story?.split("/").pop() || "";

                // Fetch high-quality image
                bookmark.image = await getHqImage(id, bookmark.image);

                // Check cache and update 'up_to_date' field if needed
                if (id) {
                    const hqBookmark = await db.getCache(db.hqMangaCache, id);
                    if (hqBookmark) {
                        bookmark.up_to_date = hqBookmark.up_to_date;
                    }
                }
            }),
        );

        return bookmarks;
    };

    useEffect(() => {
        const init = async () => {
            const updatedBookmarks = await updateBookmarks(bookmarks);
            setUpdatedBookmarks(updatedBookmarks);
        };

        init();
    }, [page]);

    return (
        <>
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 xl:gap-6">
                {updatedBookmarks.map((bookmark) => (
                    <div key={bookmark.noteid}>
                        <DesktopBookmarkCard
                            bookmark={bookmark}
                            setUpdatedBookmarks={setUpdatedBookmarks}
                        />
                        <MobileBookmarkCard
                            bookmark={bookmark}
                            setUpdatedBookmarks={setUpdatedBookmarks}
                        />
                    </div>
                ))}
            </div>
            <PaginationElement
                currentPage={page}
                totalPages={totalPages}
                className="mt-4 mb-0"
            />
        </>
    );
}
