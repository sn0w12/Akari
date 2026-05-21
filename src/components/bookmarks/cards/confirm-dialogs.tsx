import { Button } from "@/components/ui/button";
import { DrawerConfirm } from "@/components/ui/confirm";
import { Drawer, DrawerPopup, DrawerTrigger } from "@/components/ui/drawer";
import {
    ResponsiveModal,
    ResponsiveModalDialogOnly,
    ResponsiveModalDrawerOnly,
    ResponsiveModalHeader,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTitle,
    ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { removeBookmark } from "@/lib/manga/bookmarks";
import { syncAllServices } from "@/lib/manga/sync";
import { toastManager } from "@/components/ui/toast";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

export function ConfirmDialogs({
    bookmark,
}: {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
}) {
    const [open, setOpen] = useState(false);
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
        setOpen(false);

        if (!data) {
            toastManager.add({ title: "Failed to remove bookmark", type: "error" });
            return false;
        }

        toastManager.add({ title: "Bookmark removed successfully", type: "success" });
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
            toastManager.add({ title: "Failed to update bookmark", type: "error" });
            setOpen(false);
            return false;
        }

        const success = await syncAllServices(data.data);
        setOpen(false);
        if (!success) {
            toastManager.add({ title: "Failed to sync manga services", type: "error" });
            return false;
        }

        toastManager.add({ title: "Bookmark updated successfully", type: "success" });
        return true;
    }

    return (
        <ResponsiveModal desktop="popover" open={open} onOpenChange={setOpen}>
            <ResponsiveModalTrigger
                render={
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-8 self-start"
                    >
                        <EllipsisVertical />
                    </Button>
                }
            />
            <ResponsiveModalPopup align="end">
                <ResponsiveModalDrawerOnly>
                    <ResponsiveModalHeader>
                        <ResponsiveModalTitle>
                            {bookmark.title}
                        </ResponsiveModalTitle>
                    </ResponsiveModalHeader>
                    <ResponsiveModalPanel>
                        <BookmarkDrawerContent
                            bookmark={bookmark}
                            updateBookmark={handleUpdateBookmark}
                            removeBookmark={handleRemoveBookmark}
                        />
                    </ResponsiveModalPanel>
                </ResponsiveModalDrawerOnly>
                <ResponsiveModalDialogOnly>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() =>
                                handleUpdateBookmark(
                                    bookmark.mangaId,
                                    bookmark.latestChapter.number,
                                    bookmark.latestChapter.scanlatorId,
                                )
                            }
                            variant="success"
                        >
                            Mark as Read
                        </Button>
                        <Button
                            onClick={() =>
                                handleRemoveBookmark(bookmark.mangaId)
                            }
                            variant="destructive"
                        >
                            Remove Bookmark
                        </Button>
                    </div>
                </ResponsiveModalDialogOnly>
            </ResponsiveModalPopup>
        </ResponsiveModal>
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
            <Drawer open={updateOpen} onOpenChange={setUpdateOpen}>
                <DrawerTrigger render={<Button variant="success" />}>
                    Mark as Read
                </DrawerTrigger>
                <DrawerPopup>
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
                </DrawerPopup>
            </Drawer>
            <Drawer open={removeOpen} onOpenChange={setRemoveOpen}>
                <DrawerTrigger render={<Button variant="destructive" />}>
                    Remove Bookmark
                </DrawerTrigger>
                <DrawerPopup>
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
                </DrawerPopup>
            </Drawer>
        </div>
    );
}
