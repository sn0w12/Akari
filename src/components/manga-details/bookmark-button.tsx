import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { useUser } from "@/hooks/use-user";
import {
    bookmarkManga,
    checkIfBookmarked,
    removeBookmark,
} from "@/lib/manga/bookmarks";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import React, { useState, useTransition } from "react";
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
    const queryClient = useQueryClient();
    const [hovered, setHovered] = useState(false);
    const [isPending, startTransition] = useTransition();
    const fancyAnimationsEnabled = useSetting("fancyAnimations");
    const { data: user } = useUser();

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

        startTransition(async () => {
            try {
                const data = await bookmarkManga(mangaId);
                if (!data) {
                    throw new Error("Failed to bookmark manga");
                }
                await refetch();
                queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
                toastManager.add({
                    title: "Manga bookmarked",
                    type: "success",
                });
            } catch (error) {
                console.error("Failed to bookmark:", error);
            }
        });
    };

    const handleRemoveBookmark = async () => {
        if (!mangaId || isBookmarked === null || !isBookmarked) return;

        startTransition(async () => {
            try {
                const result = await removeBookmark(mangaId);
                if (!result) return;
                await refetch();
                queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            } catch (error) {
                console.error("Failed to remove bookmark:", error);
            }
        });

        toastManager.add({ title: "Bookmark removed", type: "success" });
        return true;
    };

    const buttonContent =
        isBookmarked === null || isPending || isQueryLoading ? (
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
        `w-full xl:flex-1 relative overflow-hidden text-primary not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] ${
            isBookmarked
                ? "bg-accent-positive hover:bg-negative"
                : "bg-background hover:bg-accent-positive"
        }`,
        className,
    );

    const button = (
        <Button
            aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark"}
            variant={"ghost"}
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
