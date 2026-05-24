import { Button, type ButtonProps } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { useConfirm } from "@/contexts/confirm-context";
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
import { useState, useTransition } from "react";

export interface BookmarkButtonProps extends ButtonProps {
    mangaId: string;
}

export function BookmarkButton({
    mangaId,
    className,
    disabled,
    loading,
    onClick,
    onMouseEnter,
    onMouseLeave,
    size,
    variant = "ghost",
    ...props
}: BookmarkButtonProps) {
    const queryClient = useQueryClient();
    const [hovered, setHovered] = useState(false);
    const [isPending, startTransition] = useTransition();
    const fancyAnimationsEnabled = useSetting("fancyAnimations");
    const { data: user } = useUser();
    const { confirm } = useConfirm();

    const {
        data: isBookmarked,
        isLoading: isQueryLoading,
        refetch,
    } = useQuery({
        queryKey: ["bookmark", mangaId],
        queryFn: () => checkIfBookmarked(mangaId),
        enabled: !!mangaId && !!user,
    });

    const handleBookmarkClick = () => {
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

        const confirmed = await confirm({
            title: "Confirm Bookmark Removal",
            description: "Are you sure you want to remove this bookmark?",
            variant: "destructive",
        });
        if (!confirmed) return;

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

    const handleClick: NonNullable<ButtonProps["onClick"]> = (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (isBookmarked) {
            void handleRemoveBookmark();
        } else {
            handleBookmarkClick();
        }
    };

    const handleMouseEnter: NonNullable<ButtonProps["onMouseEnter"]> = (
        event,
    ) => {
        onMouseEnter?.(event);
        setHovered(true);
    };

    const handleMouseLeave: NonNullable<ButtonProps["onMouseLeave"]> = (
        event,
    ) => {
        onMouseLeave?.(event);
        setHovered(false);
    };

    const buttonContent = (
        <div className="relative flex h-full w-full items-center justify-center">
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
                    <Bookmark />
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
        `relative overflow-hidden text-primary not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] ${
            isBookmarked
                ? "bg-accent-positive hover:bg-negative"
                : "bg-background hover:bg-accent-positive"
        }`,
        className,
    );

    const button = (
        <Button
            aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark"}
            variant={variant}
            size={size}
            className={buttonClass}
            disabled={disabled || !user || isBookmarked === undefined}
            loading={
                loading || isBookmarked === null || isPending || isQueryLoading
            }
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {buttonContent}
        </Button>
    );

    return button;
}
