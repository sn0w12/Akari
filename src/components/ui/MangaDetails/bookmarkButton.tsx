"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Spinner from "@/components/ui/spinners/puffLoader";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { useState } from "react";
import React from "react";
import { MangaDetails } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";

interface BookmarkButtonProps {
    manga: MangaDetails;
    isBookmarked: boolean | null;
    bmData: string;
}

async function bookmark(storyData: string, isBookmarked: boolean) {
    if (isBookmarked) {
        return;
    }

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
    return data;
}

async function removeBookmark(bmData: string) {
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

    const handleBookmarkClick = async () => {
        if (isStateBookmarked !== null && manga.storyData) {
            setIsLoading(true);
            try {
                const data = await bookmark(manga.storyData, isStateBookmarked);
                setIsLoading(false);
                console.log(data);

                if (data) {
                    setIsStateBookmarked(!isStateBookmarked);
                }
            } catch (error) {
                console.error("Failed to bookmark:", error);
            }
        }
    };

    const handleRemoveBookmark = async () => {
        const data = await removeBookmark(bmData);
        if (data.result === "error") {
            new Toast(
                "Failed to remove bookmark.\nPlease find the manga in your bookmarks first.",
                "error",
            );
            return false;
        }

        setIsStateBookmarked(false);
        return true;
    };

    const buttonContent =
        isStateBookmarked === null || isLoading ? (
            <Spinner size={30} />
        ) : (
            <div className="relative w-full h-full flex items-center justify-center">
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
            </div>
        );

    const buttonClass = `w-full relative overflow-hidden ${
        isStateBookmarked
            ? "bg-green-500 text-white hover:bg-red-600"
            : "hover:bg-green-500"
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
            confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
            cancelLabel="Cancel"
            onConfirm={handleRemoveBookmark}
        />
    ) : (
        button
    );
};

export default BookmarkButton;
