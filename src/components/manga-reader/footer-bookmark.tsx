"use client";

import { Chapter } from "@/types/manga";
import { checkIfBookmarked, bookmarkManga } from "@/lib/manga/bookmarks";
import { Button } from "../ui/button";
import Toast from "@/lib/toast-wrapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "../ui/puff-loader";

export function FooterBookmarkButton({
    chapterData,
}: {
    chapterData: Chapter;
}) {
    const queryClient = useQueryClient();

    const { data: isBookmarked, isLoading } = useQuery({
        queryKey: ["bookmark", chapterData?.mangaId],
        queryFn: () => checkIfBookmarked(chapterData?.mangaId || ""),
        enabled: !!chapterData?.mangaId,
    });

    const bookmarkMutation = useMutation({
        mutationFn: () =>
            bookmarkManga(chapterData?.mangaId || "", chapterData),
        onSuccess: (result) => {
            if (result) {
                new Toast("Manga bookmarked", "success");
                queryClient.invalidateQueries({
                    queryKey: ["bookmark", chapterData?.mangaId],
                });
            } else {
                new Toast("Failed to bookmark manga", "error");
            }
        },
        onError: (error) => {
            console.error("Failed to bookmark:", error);
            new Toast("Failed to bookmark manga", "error");
        },
    });

    const handleBookmark = () => {
        if (!chapterData || isBookmarked) return;
        bookmarkMutation.mutate();
    };

    if (isLoading) {
        return (
            <Button
                className="inline-flex flex-grow items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input  h-9 w-28 px-4 py-2 bg-background text-accent-foreground"
                disabled
            >
                <Spinner size={30} />
            </Button>
        );
    }

    return (
        <Button
            className={`inline-flex flex-grow items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input  h-9 w-28 px-4 py-2 ${
                isBookmarked
                    ? "bg-accent-positive hover:positive/70 text-white"
                    : "bg-background hover:bg-accent text-accent-foreground"
            }`}
            onClick={handleBookmark}
            disabled={isBookmarked || bookmarkMutation.isPending}
        >
            {bookmarkMutation.isPending
                ? "Loading..."
                : isBookmarked
                ? "Bookmarked"
                : "Bookmark"}
        </Button>
    );
}
