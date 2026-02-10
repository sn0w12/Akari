"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import {
    bookmarkManga,
    checkIfBookmarked,
    removeBookmark,
} from "@/lib/manga/bookmarks";
import { useSetting } from "@/lib/settings";
import Toast from "@/lib/toast-wrapper";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import React, { useState } from "react";
import { ButtonConfirmDialog } from "../ui/confirm";
import Spinner from "../ui/puff-loader";

interface BookmarkButtonProps {
    mangaId: string;
    className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    mangaId,
    className,
}) => {
    const [hovered, setHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fancyAnimationsEnabled = useSetting("fancyAnimations");
    const { user } = useUser();

    const {
        data: isBookmarked,
        isLoading: isQueryLoading,
        refetch,
    } = useQuery({
        queryKey: ["bookmark", mangaId],
        queryFn: () => checkIfBookmarked(mangaId),
        enabled: !!mangaId && !!user,
    });

    const handleBookmarkClick = async () => {
        if (!mangaId || isBookmarked === null || isBookmarked) return;

        setIsLoading(true);
        try {
            const data = await bookmarkManga(mangaId);
            if (!data) {
                throw new Error("Failed to bookmark manga");
            }
            await refetch();
            new Toast("Manga bookmarked", "success");
        } catch (error) {
            console.error("Failed to bookmark:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveBookmark = async () => {
        if (!mangaId || isBookmarked === null || !isBookmarked) return;

        try {
            setIsLoading(true);
            const result = await removeBookmark(mangaId);
            if (!result) return;
            await refetch();
        } catch (error) {
            console.error("Failed to remove bookmark:", error);
        } finally {
            setIsLoading(false);
        }

        new Toast("Bookmark removed", "success");
        return true;
    };

    const buttonContent =
        isBookmarked === null || isLoading || isQueryLoading ? (
            <Spinner size={30} />
        ) : (
            <div className="relative w-full h-full flex items-center justify-center">
                {fancyAnimationsEnabled ? (
                    <>
                        <Bookmark
                            className={`transition-all duration-300 ease-in-out ${
                                isBookmarked && hovered
                                    ? "-translate-x-7"
                                    : "translate-x-0"
                            }`}
                        />
                        <span
                            className={`absolute transition-all duration-300 ease-in-out -translate-x-6.5 ${
                                isBookmarked && hovered
                                    ? "opacity-100"
                                    : "opacity-0"
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
                    </>
                ) : (
                    <>
                        <Bookmark className="mr-2" />
                        <span>
                            {isBookmarked
                                ? hovered
                                    ? "Remove"
                                    : "Bookmarked"
                                : "Bookmark"}
                        </span>
                    </>
                )}
            </div>
        );

    const buttonClass = cn(
        `w-full xl:flex-1 relative overflow-hidden text-primary ${
            isBookmarked
                ? "bg-accent-positive hover:bg-negative"
                : "bg-background border hover:border-accent-positive hover:bg-accent-positive"
        }`,
        className,
    );

    const button = (
        <Button
            aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark"}
            variant={"default"}
            size="lg"
            className={buttonClass}
            disabled={!user || isBookmarked === undefined}
            onClick={handleBookmarkClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {buttonContent}
        </Button>
    );

    return isBookmarked ? (
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
