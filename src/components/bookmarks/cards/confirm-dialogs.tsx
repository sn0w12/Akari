import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonConfirmDialog } from "@/components/ui/confirm";
import { removeBookmark } from "@/lib/manga/bookmarks";
import { syncAllServices } from "@/lib/manga/sync";
import { client } from "@/lib/api";

export function ConfirmDialogs({
    bookmark,
    setUpdatedBookmarks,
    className,
}: {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
    setUpdatedBookmarks: React.Dispatch<
        React.SetStateAction<
            components["schemas"]["BookmarkListResponse"]["items"][number][]
        >
    >;
    className?: string;
}) {
    async function handleRemoveBookmark(mangaId: string) {
        const data = await removeBookmark(mangaId);

        if (data) {
            setUpdatedBookmarks((prev) =>
                prev.filter((bookmark) => bookmark.mangaId !== mangaId),
            );
        }
    }

    async function handleUpdateBookmark(id: string, subId: number | undefined) {
        if (!subId) {
            return false;
        }

        const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
            params: {
                path: {
                    id: id,
                    subId: subId,
                },
            },
        });

        if (error) {
            return false;
        }

        return await syncAllServices(data.data);
    }

    return (
        <div
            className={cn(
                "flex flex-row items-center gap-2 self-start",
                className,
            )}
        >
            <ButtonConfirmDialog
                triggerButton={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 rounded-sm bg-negative border border-negative text-accent hover:text-negative focus:outline-none"
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
                onConfirm={() => handleRemoveBookmark(bookmark.mangaId)}
            />
            <ButtonConfirmDialog
                triggerButton={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 rounded-sm bg-accent-positive border border-accent-positive text-accent hover:text-accent-positive focus:outline-none"
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
                        bookmark.mangaId,
                        bookmark.chapters[0]?.number,
                    )
                }
            />
        </div>
    );
}
