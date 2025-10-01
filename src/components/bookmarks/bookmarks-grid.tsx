"use client";

import { useState } from "react";
import { ServerPagination } from "../ui/pagination/server-pagination";
import { Bookmark } from "@/types/manga";
import DesktopBookmarkCard from "./cards/desktop-card";
import MobileBookmarkCard from "./cards/mobile-card";

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
                    <div key={bookmark.id}>
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
            <ServerPagination
                currentPage={page}
                totalPages={totalPages}
                className="mt-4 mb-0"
            />
        </section>
    );
}
