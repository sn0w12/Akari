"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Spinner from "@/components/ui/spinners/puffLoader";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { useEffect, useState } from "react";
import React from "react";
import { MangaDetails } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import db from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { useSettingsVersion } from "@/lib/settings";

interface BookmarkButtonProps {
    manga: MangaDetails;
    isBookmarked: boolean | null;
    bmData: string;
}

async function bookmark(manga: MangaDetails, isBookmarked: boolean) {
    if (isBookmarked) {
        return;
    }

    const storyData = manga.storyData;
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
        return;
    } else if (data.result === "ok") {
        new Toast("Bookmark added.", "success");
    }

    const firstChapterId = manga.chapterList[manga.chapterList.length - 1].id;
    const firstChapter = await fetch(
        `/api/manga/${manga.identifier}/${firstChapterId}`,
    );
    const firstChapterData = await firstChapter.json();

    const updateResponse = await fetch("/api/bookmarks/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            story_data: storyData,
            chapter_data: firstChapterData.chapterData,
        }),
    });
    const updateData = await updateResponse.json();
    if (updateData.result === "error") {
        new Toast("Failed to update bookmark.", "error");
        return;
    }
    db.updateCache(db.mangaCache, manga.identifier, {
        last_read: firstChapterId,
    });

    return updateData;
}

async function findBookmarkData(
    identifier: string,
    page = 1,
): Promise<string | null> {
    const response = await fetch(`/api/bookmarks?page=${page}`);
    const data = await response.json();

    if (!data.bookmarks || data.result === "error") {
        return null;
    }

    const bookmark = data.bookmarks.find((bm: any) =>
        bm.link_story.includes(identifier),
    );

    if (bookmark) {
        return bookmark.bm_data;
    }

    if (page < data.totalPages) {
        return findBookmarkData(identifier, page + 1);
    }

    return null;
}

async function removeBookmark(bmData: string, manga: MangaDetails) {
    if (!bmData) {
        // Try to find the bookmark data if not provided
        const foundBmData = await findBookmarkData(manga.identifier);
        if (!foundBmData) {
            new Toast("Could not find bookmark data", "error");
            return false;
        }
        bmData = foundBmData;
    }

    const response = await fetch("/api/bookmarks/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            bm_data: bmData,
        }),
    });
    const data = await response.json();

    if (data.result === "error") {
        new Toast(
            "Failed to remove bookmark.\nPlease find the manga in your bookmarks first.",
            "error",
        );
        return false;
    } else if (data.result === "ok") {
        new Toast("Bookmark removed.", "success");
    }

    return data;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    manga,
    isBookmarked,
    bmData,
}) => {
    const [hovered, setHovered] = useState(false);
    const [isStateBookmarked, setIsStateBookmarked] = useState<boolean | null>(
        isBookmarked,
    );
    const [isLoading, setIsLoading] = useState(false);
    const settingsVersion = useSettingsVersion();
    const [fancyAnimationsEnabled, setFancyAnimationsEnabled] = useState(false);
    useEffect(() => {
        setFancyAnimationsEnabled(getSetting("fancyAnimations"));
    }, [settingsVersion]);

    const handleBookmarkClick = async () => {
        if (isStateBookmarked !== null && manga.storyData) {
            setIsLoading(true);
            try {
                const data = await bookmark(manga, isStateBookmarked);
                setIsLoading(false);

                if (data) {
                    setIsStateBookmarked(!isStateBookmarked);
                }
            } catch (error) {
                console.error("Failed to bookmark:", error);
            }
        } else {
            new Toast("Failed to bookmark.", "error");
        }
    };

    const handleRemoveBookmark = async () => {
        await removeBookmark(bmData, manga);
        setIsStateBookmarked(false);
        return true;
    };

    const buttonContent =
        isStateBookmarked === null || isLoading ? (
            <Spinner size={30} />
        ) : (
            <div className="relative w-full h-full flex items-center justify-center">
                {fancyAnimationsEnabled ? (
                    <>
                        <Bookmark
                            className={`transition-all duration-300 ease-in-out ${
                                isStateBookmarked && hovered
                                    ? "-translate-x-7"
                                    : "translate-x-0"
                            }`}
                        />
                        <span
                            className={`absolute transition-all duration-300 ease-in-out -translate-x-5 ${
                                isStateBookmarked && hovered
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                        >
                            Remove
                        </span>
                        <span
                            className={`ml-2 transition-all duration-300 ease-in-out ${
                                isStateBookmarked && hovered
                                    ? "translate-x-7"
                                    : "translate-x-0"
                            }`}
                        >
                            Bookmark
                        </span>
                    </>
                ) : (
                    <>
                        <Bookmark className="mr-2" />
                        <span>
                            {isStateBookmarked
                                ? hovered
                                    ? "Remove"
                                    : "Bookmarked"
                                : "Bookmark"}
                        </span>
                    </>
                )}
            </div>
        );

    const buttonClass = `w-full relative overflow-hidden ${
        isStateBookmarked
            ? "bg-positive text-white hover:bg-negative"
            : "hover:bg-positive"
    }`;

    const button = (
        <Button
            variant={isStateBookmarked ? "default" : "outline"}
            size="lg"
            className={buttonClass}
            disabled={isStateBookmarked === undefined}
            onClick={handleBookmarkClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {buttonContent}
        </Button>
    );

    return isStateBookmarked ? (
        <ConfirmDialog
            triggerButton={button}
            title="Confirm Bookmark Removal"
            message="Are you sure you want to remove this bookmark?"
            confirmLabel="Remove"
            confirmColor="bg-negative border-negative hover:bg-negative/70"
            cancelLabel="Cancel"
            onConfirm={handleRemoveBookmark}
        />
    ) : (
        button
    );
};

export default BookmarkButton;
