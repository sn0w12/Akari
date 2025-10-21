import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonConfirmDialog } from "@/components/ui/confirm";
import { removeBookmark } from "@/lib/manga/bookmarks";
import { cn } from "@/lib/utils";
import { syncAllServices } from "@/lib/manga/sync";
import { Bookmark, Chapter } from "@/types/manga";
import { fetchApi, isApiErrorResponse } from "@/lib/api";

export function ConfirmDialogs({
    bookmark,
    setUpdatedBookmarks,
    className,
}: {
    bookmark: Bookmark;
    setUpdatedBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
    className?: string;
}) {
    async function handleRemoveBookmark(mangaId: string) {
        const data = await removeBookmark(mangaId);

        if (data) {
            setUpdatedBookmarks((prev) =>
                prev.filter((bookmark) => bookmark.id !== mangaId)
            );
        }
    }

    async function handleUpdateBookmark(id: string, subId: string) {
        const response = await fetchApi<Chapter>(
            `/api/v1/manga/${id}/${subId}`
        );
        if (isApiErrorResponse(response)) {
            return;
        }

        return await syncAllServices(response.data);
    }

    return (
        <div
            className={cn(
                "flex flex-row items-center gap-2 self-start",
                className
            )}
        >
            <ButtonConfirmDialog
                triggerButton={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 md:w-10 md:h-10 bg-negative text-accent hover:text-negative focus:outline-none"
                        aria-label="Remove bookmark"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                }
                title="Confirm Bookmark Removal"
                description="Are you sure you want to remove this bookmark?"
                confirmText="Remove"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={() => handleRemoveBookmark(bookmark.id)}
            />
            <ButtonConfirmDialog
                triggerButton={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 md:w-10 md:h-10 bg-accent-positive text-accent hover:text-accent-positive focus:outline-none"
                        aria-label="Mark as read"
                    >
                        <Check className="h-5 w-5" />
                    </Button>
                }
                title="Mark as read"
                description="Are you sure you want to mark the latest chapter as read?"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() =>
                    handleUpdateBookmark(
                        bookmark.mangaUrl?.split("/").pop() || "",
                        bookmark.latestChapter.url.split("/").pop() || ""
                    )
                }
            />
        </div>
    );
}
