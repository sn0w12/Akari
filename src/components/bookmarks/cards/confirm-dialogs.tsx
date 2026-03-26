"use client";

import { Button } from "@/components/ui/button";
import { DrawerConfirm } from "@/components/ui/confirm";
import {
    DrawerContent,
    DrawerNested,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    PopoverDrawer,
    PopoverDrawerContent,
    PopoverDrawerTrigger,
} from "@/components/ui/popover-drawer";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { removeBookmark } from "@/lib/manga/bookmarks";
import { syncAllServices } from "@/lib/manga/sync";
import Toast from "@/lib/toast-wrapper";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

export function ConfirmDialogs({
    bookmark,
}: {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
}) {
    const { confirm } = useConfirm();

    async function handleRemoveBookmark(mangaId: string, shouldConfirm = true) {
        if (shouldConfirm) {
            const confirmed = await confirm({
                title: "Remove Bookmark",
                description: "Are you sure you want to remove this bookmark?",
                confirmText: "Yes, remove it",
                cancelText: "No, keep it",
                variant: "destructive",
            });
            if (!confirmed) {
                return false;
            }
        }

        const data = await removeBookmark(mangaId);

        if (!data) {
            new Toast("Failed to remove bookmark", "error");
            return false;
        }

        new Toast("Bookmark removed successfully", "success");
        return true;
    }

    async function handleUpdateBookmark(
        id: string,
        subId: number,
        scanlator: number,
        shouldConfirm = true,
    ) {
        if (shouldConfirm) {
            const confirmed = await confirm({
                title: "Mark as Read",
                description:
                    "Are you sure you want to mark this manga as read?",
                confirmText: "Yes, mark as read",
                cancelText: "No, keep it",
            });
            if (!confirmed) {
                return false;
            }
        }

        if (!subId) {
            return false;
        }

        const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
            params: {
                path: {
                    id: id,
                    subId: subId,
                },
                query: {
                    scanlatorId: scanlator,
                },
            },
        });

        if (error) {
            new Toast("Failed to update bookmark", "error");
            return false;
        }

        const success = await syncAllServices(data.data);
        if (!success) {
            new Toast("Failed to sync manga services", "error");
            return false;
        }

        new Toast("Bookmark updated successfully", "success");
        return true;
    }

    return (
        <PopoverDrawer>
            <PopoverDrawerTrigger>
                <Button
                    variant="outline"
                    size="sm"
                    className="size-8 self-start"
                >
                    <EllipsisVertical />
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent type="drawer" drawerTitle={bookmark.title}>
                <BookmarkDrawerContent
                    bookmark={bookmark}
                    updateBookmark={handleUpdateBookmark}
                    removeBookmark={handleRemoveBookmark}
                />
            </PopoverDrawerContent>
            <PopoverDrawerContent type="popover" popoverClassName="p-2">
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={() =>
                            handleUpdateBookmark(
                                bookmark.mangaId,
                                bookmark.latestChapter.number,
                                bookmark.latestChapter.scanlatorId,
                            )
                        }
                        variant="ghost"
                        className="bg-accent-positive border border-accent-positive text-accent hover:text-accent-positive focus:outline-none"
                    >
                        Mark as Read
                    </Button>
                    <Button
                        onClick={() => handleRemoveBookmark(bookmark.mangaId)}
                        variant="ghost"
                        className="bg-destructive border border-negative text-accent hover:text-negative focus:outline-none"
                    >
                        Remove Bookmark
                    </Button>
                </div>
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
}

function BookmarkDrawerContent({
    bookmark,
    updateBookmark,
    removeBookmark,
}: {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
    updateBookmark: (
        id: string,
        subId: number,
        scanlatorId: number,
        shouldConfirm?: boolean,
    ) => Promise<boolean>;
    removeBookmark: (id: string, shouldConfirm?: boolean) => Promise<boolean>;
}) {
    const [updateOpen, setUpdateOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <DrawerNested open={updateOpen} onOpenChange={setUpdateOpen}>
                <DrawerTrigger asChild>
                    <Button className="bg-accent-positive">Mark as Read</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerConfirm
                        title="Mark as Read"
                        description="Are you sure?"
                        onCancel={() => setUpdateOpen(false)}
                        onConfirm={async () => {
                            await updateBookmark(
                                bookmark.mangaId,
                                bookmark.latestChapter.number,
                                bookmark.latestChapter.scanlatorId,
                                false,
                            );
                            setUpdateOpen(false);
                        }}
                    />
                </DrawerContent>
            </DrawerNested>
            <DrawerNested open={removeOpen} onOpenChange={setRemoveOpen}>
                <DrawerTrigger asChild>
                    <Button className="bg-destructive">Remove Bookmark</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerConfirm
                        title="Remove Bookmark"
                        description="Are you sure?"
                        variant="destructive"
                        onCancel={() => setRemoveOpen(false)}
                        onConfirm={async () => {
                            await removeBookmark(bookmark.mangaId, false);
                            setRemoveOpen(false);
                        }}
                    />
                </DrawerContent>
            </DrawerNested>
        </div>
    );
}
