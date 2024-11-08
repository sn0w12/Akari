"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Spinner from "@/components/ui/spinners/puffLoader";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { useState } from "react";
import React from "react";
import { Manga } from "@/app/api/interfaces";

interface BookmarkButtonProps {
    manga: Manga;
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

    const handleBookmarkClick = () => {
        if (isBookmarked !== null) {
            bookmark(manga.storyData, isBookmarked);
        }
    };

    const handleRemoveBookmark = () => {
        removeBookmark(bmData);
    };

    const buttonContent =
        isBookmarked === null ? (
            <Spinner size={30} />
        ) : (
            <div className="relative w-full h-full flex items-center justify-center">
                <Bookmark
                    className={`transition-all duration-300 ease-in-out ${
                        isBookmarked && hovered
                            ? "-translate-x-7"
                            : "translate-x-0"
                    }`}
                />
                <span
                    className={`absolute transition-all duration-300 ease-in-out -translate-x-5 ${
                        isBookmarked && hovered ? "opacity-100" : "opacity-0"
                    }`}
                >
                    Remove
                </span>
                <span
                    className={`ml-2 transition-all duration-300 ease-in-out ${
                        isBookmarked && hovered
                            ? "translate-x-7"
                            : "translate-x-0"
                    }`}
                >
                    Bookmark
                </span>
            </div>
        );

    const buttonClass = `w-full relative overflow-hidden ${
        isBookmarked
            ? "bg-green-500 text-white hover:bg-red-600"
            : "hover:bg-green-500"
    }`;

    const button = (
        <Button
            variant={isBookmarked ? "default" : "outline"}
            size="lg"
            className={buttonClass}
            disabled={isBookmarked === undefined}
            onClick={handleBookmarkClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {buttonContent}
        </Button>
    );

    return isBookmarked ? (
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
