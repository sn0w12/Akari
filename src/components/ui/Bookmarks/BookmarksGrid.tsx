"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";
import PaginationElement from "@/components/ui/Pagination/ClientPaginationElement";
import { X } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { Bookmark } from "@/app/api/interfaces";
import DesktopBookmarkCard from "./DesktopBookmarkCard";
import MobileBookmarkCard from "./MobileBookmarkCard";
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
    const router = useRouter();
    const [updatedBookmarks, setUpdatedBookmarks] = useState<Bookmark[]>([]);

    async function removeBookmark(bm_data: string, noteid: string) {
        const response = await fetch("/api/bookmarks/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                bm_data: bm_data,
            }),
        });
        const data = await response.json();

        if (data.result === "ok") {
            // Update the bookmarks state to remove the deleted bookmark
            bookmarks = bookmarks.filter(
                (bookmark) => bookmark.noteid !== noteid,
            );
        }
    }

    const handlePageChange = useCallback(
        (page: number) => {
            router.push(`/bookmarks?page=${page}`);
        },
        [router],
    );

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
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                {updatedBookmarks.map((bookmark) => (
                    <div key={bookmark.noteid} className="block relative">
                        {/* X button in top-right corner */}
                        <ConfirmDialog
                            triggerButton={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-5 h-5 md:w-10 md:h-10 absolute top-2 right-2 bg-red-600 text-accent hover:text-red-600 focus:outline-none"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            }
                            title="Confirm Bookmark Removal"
                            message="Are you sure you want to remove this bookmark?"
                            confirmLabel="Remove"
                            confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                            cancelLabel="Cancel"
                            onConfirm={() =>
                                removeBookmark(
                                    bookmark.bm_data,
                                    bookmark.noteid,
                                )
                            }
                        />
                        <DesktopBookmarkCard bookmark={bookmark} />
                        <MobileBookmarkCard bookmark={bookmark} />
                    </div>
                ))}
            </div>
            <PaginationElement
                currentPage={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                className="mt-6 mb-0"
            />
        </>
    );
}
