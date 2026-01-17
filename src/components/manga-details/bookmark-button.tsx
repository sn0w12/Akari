"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { bookmarkManga, removeBookmark } from "@/lib/manga/bookmarks";
import { useSetting } from "@/lib/settings";
import Toast from "@/lib/toast-wrapper";
import { Bookmark } from "lucide-react";
import React, { useState } from "react";
import { ButtonConfirmDialog } from "../ui/confirm";
import Spinner from "../ui/puff-loader";

interface BookmarkButtonProps {
    manga: components["schemas"]["MangaResponse"];
    isBookmarked: boolean | null;
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
    const fancyAnimationsEnabled = useSetting("fancyAnimations");
    const { user } = useUser();

    const handleBookmarkClick = async () => {
        if (!manga.id || isStateBookmarked === null || isStateBookmarked)
            return;

        setIsLoading(true);
        try {
            const data = await bookmarkManga(manga.id);
            setIsLoading(false);

            if (data) {
                setIsStateBookmarked(!isStateBookmarked);
                new Toast("Manga bookmarked", "success");
            }
        } catch (error) {
            console.error("Failed to bookmark:", error);
        }
    };

    const handleRemoveBookmark = async () => {
        if (!manga.id || isStateBookmarked === null || !isStateBookmarked)
            return;

        const result = await removeBookmark(manga.id);
        if (!result) return;

        setIsStateBookmarked(false);
        new Toast("Bookmark removed", "success");
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
                            className={`absolute transition-all duration-300 ease-in-out -translate-x-6.5 ${
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

    const buttonClass = `w-full xl:flex-1 relative overflow-hidden text-primary ${
        isStateBookmarked
            ? "bg-accent-positive hover:bg-negative"
            : "bg-background border hover:border-accent-positive hover:bg-accent-positive"
    }`;

    const button = (
        <Button
            aria-label={isStateBookmarked ? "Remove Bookmark" : "Bookmark"}
            variant={"default"}
            size="lg"
            className={buttonClass}
            disabled={!user || isStateBookmarked === undefined}
            onClick={handleBookmarkClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {buttonContent}
        </Button>
    );

    return isStateBookmarked ? (
        <ButtonConfirmDialog
            triggerButton={button}
            title="Confirm Bookmark Removal"
            description="Are you sure you want to remove this bookmark?"
            variant="destructive"
            onConfirm={handleRemoveBookmark}
        />
    ) : (
        button
    );
};

export default BookmarkButton;
