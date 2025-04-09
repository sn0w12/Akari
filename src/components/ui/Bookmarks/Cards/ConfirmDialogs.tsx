import { Check, X } from "lucide-react";
import { Button } from "../../button";
import ConfirmDialog from "../../confirmDialog";
import { Bookmark } from "@/app/api/interfaces";
import { syncAllServices } from "@/lib/sync";
import { cn } from "@/lib/utils";

export function ConfirmDialogs({
    bookmark,
    setUpdatedBookmarks,
    className,
}: {
    bookmark: Bookmark;
    setUpdatedBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
    className?: string;
}) {
    async function removeBookmark(noteid: string) {
        const response = await fetch("/api/bookmarks/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: noteid }),
        });
        const data = await response.json();

        if (data.result === "ok") {
            // Update the bookmarks state to remove the deleted bookmark
            setUpdatedBookmarks((prev) =>
                prev.filter((bookmark) => bookmark.noteid !== noteid),
            );
        }
    }

    async function updateBookmark(id: string, subId: string) {
        const response = await fetch(`/api/manga/${id}/${subId}`);
        if (!response.ok) {
            throw new Error(
                `Network response was not ok: ${response.statusText}`,
            );
        }
        const data = await response.json();
        return await syncAllServices(data);
    }

    return (
        <div
            className={cn(
                "flex flex-row items-center gap-2 self-start",
                className,
            )}
        >
            <ConfirmDialog
                triggerButton={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 md:w-10 md:h-10 bg-negative text-accent hover:text-negative focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                }
                title="Confirm Bookmark Removal"
                message="Are you sure you want to remove this bookmark?"
                confirmLabel="Remove"
                confirmColor="bg-negative border-negative hover:bg-negative/70"
                cancelLabel="Cancel"
                onConfirm={() => removeBookmark(bookmark.noteid)}
            />
            <ConfirmDialog
                triggerButton={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 md:w-10 md:h-10 bg-positive text-accent hover:text-positive focus:outline-none"
                    >
                        <Check className="h-5 w-5" />
                    </Button>
                }
                title="Mark as read"
                message="Are you sure you want to mark the latest chapter as read?"
                confirmLabel="Confirm"
                confirmColor="bg-positive border-positive hover:bg-positive/70"
                cancelLabel="Cancel"
                onConfirm={() =>
                    updateBookmark(
                        bookmark.link_story?.split("/").pop() || "",
                        bookmark.link_chapter_last.split("/").pop() || "",
                    )
                }
            />
        </div>
    );
}
