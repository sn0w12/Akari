"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Spinner from "@/components/ui/spinners/puffLoader";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { useEffect, useState } from "react";
import React from "react";
import { MangaDetails } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import { getSetting } from "@/lib/settings";
import { useSettingsVersion } from "@/lib/settings";

interface BookmarkButtonProps {
    manga: MangaDetails;
    isBookmarked: boolean | null;
}

async function bookmark(manga: MangaDetails, isBookmarked: boolean) {
    if (isBookmarked) {
        return;
    }

    const response = await fetch("/api/bookmarks/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: manga.mangaId,
        }),
    });

    const data = await response.json();

    if (data.success !== true) {
        new Toast("Failed to bookmark.", "error");
        return;
    } else {
        new Toast("Bookmark added.", "success");
    }

    return data;
}

async function removeBookmark(manga: MangaDetails) {
    const response = await fetch("/api/bookmarks/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: manga.mangaId,
        }),
    });
    const data = await response.json();

    if (data.success !== true) {
        new Toast(
            "Failed to remove bookmark.\nPlease find the manga in your bookmarks first.",
            "error",
        );
        return false;
    } else {
        new Toast("Bookmark removed.", "success");
    }

    return data;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    manga,
    isBookmarked,
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
        if (isStateBookmarked !== null) {
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
        await removeBookmark(manga);
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
            aria-label={isStateBookmarked ? "Remove Bookmark" : "Bookmark"}
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
