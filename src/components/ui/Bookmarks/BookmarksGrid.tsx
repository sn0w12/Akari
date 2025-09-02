"use client";

import { useState } from "react";
import React from "react";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { Bookmark } from "@/app/api/interfaces";
import DesktopBookmarkCard from "./Cards/DesktopBookmarkCard";
import MobileBookmarkCard from "./Cards/MobileBookmarkCard";

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
    const [updatedBookmarks, setUpdatedBookmarks] =
        useState<Bookmark[]>(bookmarks);

    return (
        <section>
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
        </section>
    );
}
