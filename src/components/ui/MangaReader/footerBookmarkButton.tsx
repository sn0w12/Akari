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
                if (!chapterData.mangaId) return;
                const result = await checkIfBookmarked(chapterData.mangaId);
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
        const response = await fetch("/api/bookmarks/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: chapterData.mangaId,
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
                manga_id: chapterData.mangaId,
                chapter_id: chapterData.chapterId,
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
                    ? "bg-positive hover:positive/70 text-white"
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
