"use client";

import { Chapter } from "@/app/api/interfaces";
import { checkIfBookmarked } from "@/lib/bookmarks";
import { Button } from "../button";
import Toast from "@/lib/toastWrapper";
import db from "@/lib/db";
import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/spinners/puffLoader";

export function FooterBookmarkButton({
    chapterData,
}: {
    chapterData: Chapter;
}) {
    const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkBookmark = async () => {
            setIsLoading(true);
            if (!chapterData) return;

            try {
                let mangaId = null;
                // Only try to access IndexedDB on client side
                if (typeof window !== "undefined") {
                    const cache = await db.getCache(
                        db.mangaCache,
                        chapterData.parentId,
                    );
                    if (cache && cache.id) {
                        mangaId = cache.id;
                    }
                }

                if (!mangaId) {
                    const response = await fetch(
                        `/api/manga/${chapterData.parentId}`,
                    );
                    const manga = await response.json();
                    mangaId = manga.mangaId;
                }

                const result = await checkIfBookmarked(mangaId);
                setIsBookmarked((result as boolean) ?? false);
            } catch (error) {
                console.error("Failed to check bookmark:", error);
                setIsBookmarked(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkBookmark();
    }, [chapterData.parentId]);

    async function bookmarkManga() {
        setIsLoading(true);
        const storyData = chapterData.storyData;
        const response = await fetch("/api/bookmarks/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                story_data: storyData,
            }),
        });

        const data = await response.json();

        if (data.result === "error") {
            new Toast("Failed to bookmark.", "error");
            setIsLoading(false);
            return;
        } else if (data.result === "ok") {
            setIsBookmarked(true);
            new Toast("Bookmark added.", "success");
        }

        const updateResponse = await fetch("/api/bookmarks/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                story_data: storyData,
                chapter_data: chapterData.chapterData,
            }),
        });
        const updateData = await updateResponse.json();
        if (updateData.result === "error") {
            new Toast("Failed to update bookmark.", "error");
            setIsLoading(false);
            return;
        }
        db.updateCache(db.mangaCache, chapterData.parentId, {
            last_read: chapterData.chapter,
        });
        setIsLoading(false);
    }

    if (isLoading) {
        return (
            <Button
                className="inline-flex flex-grow items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-9 w-28 px-4 py-2 bg-background text-accent-foreground"
                disabled
            >
                <Spinner size={30} />
            </Button>
        );
    }

    return (
        <Button
            className={`inline-flex flex-grow items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-9 w-28 px-4 py-2 ${
                isBookmarked
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-background hover:bg-accent text-accent-foreground"
            }`}
            onClick={bookmarkManga}
            disabled={isBookmarked ?? true}
        >
            {isLoading
                ? "Loading..."
                : isBookmarked
                  ? "Bookmarked"
                  : "Bookmark"}
        </Button>
    );
}
