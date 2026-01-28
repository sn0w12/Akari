"use client";

import { SyncBody } from "@/components/sync/sync-body";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { StorageManager } from "@/lib/storage";
import Toast from "@/lib/toast-wrapper";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SyncAniPage() {
    const [aniData, setAniData] = useState<components["schemas"]["AniEntry"][]>(
        [],
    );
    const [bookmarks, setBookmarks] = useState<
        components["schemas"]["BookmarkListResponse"]["items"]
    >([]);
    const [aniLoading, setAniLoading] = useState(true);
    const [bookmarksLoading, setBookmarksLoading] = useState(true);
    const [bookmarksProgress, setBookmarksProgress] = useState(0);
    const { confirm } = useConfirm();

    const getStatusVariant = (status: string | null) => {
        switch (status) {
            case "COMPLETED":
                return "default";
            case "CURRENT":
                return "secondary";
            case "PAUSED":
                return "outline";
            case "DROPPED":
                return "destructive";
            case "PLANNING":
                return "shadow";
            default:
                return "outline";
        }
    };

    useEffect(() => {
        async function fetchAllAniList() {
            const aniListUserStorage = StorageManager.get("aniListUser");
            const userName = aniListUserStorage.get()?.name;
            if (!userName) {
                setAniLoading(false);
                return;
            }

            const { data, error } = await client.GET("/v2/ani/mangalist", {
                params: {
                    query: {
                        userName: userName,
                    },
                },
            });

            if (error) {
                console.error("Error fetching AniList manga list:", error);
                setAniLoading(false);
                return;
            }

            setAniData(data?.data.lists[0].entries);
            setAniLoading(false);
        }

        async function fetchAllBookmarks() {
            let allData: components["schemas"]["BookmarkListResponse"]["items"] =
                [];
            let page: number = 1;
            let totalPages = 0;

            while (true) {
                const { data, error } = await client.GET("/v2/bookmarks", {
                    params: {
                        query: {
                            page: page,
                            pageSize: 100,
                        },
                    },
                });

                if (error || !data) {
                    console.error("Error fetching bookmarks:", error);
                    setBookmarksLoading(false);
                    break;
                }

                if (data.data?.items) {
                    allData = [...allData, ...data.data.items];
                }

                if (!totalPages && data.data?.totalPages) {
                    totalPages = data.data.totalPages;
                }

                if (totalPages) {
                    setBookmarksProgress((page / totalPages) * 100);
                }

                if (page >= (data.data?.totalPages || 0)) {
                    break;
                }
                page += 1;
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            setBookmarks(allData);
            setBookmarksLoading(false);
        }

        fetchAllAniList();
        fetchAllBookmarks();
    }, []);

    async function syncAniToBookmarks() {
        if (aniData.length === 0) {
            new Toast("No AniList data to sync", "warning");
            return;
        }

        const confirmed = await confirm({
            title: "Confirm AniList Sync",
            description:
                "Are you sure you want to sync your AniList data to bookmarks?",
            confirmText: "Yes, Sync",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        const aniDataToSync = aniData.filter(
            (item) =>
                !bookmarks.some((bookmark) => bookmark.aniId === item.media.id),
        );

        if (aniDataToSync.length === 0) {
            new Toast("All manga already synced", "info", {
                description: "No new manga to sync from your AniList",
            });
            return;
        }

        const alreadySynced = aniData.length - aniDataToSync.length;
        new Toast(`Starting sync of ${aniDataToSync.length} manga`, "info", {
            description:
                alreadySynced > 0
                    ? `Skipping ${alreadySynced} already synced manga`
                    : undefined,
        });

        const batchSize = 50;
        const updateItems: components["schemas"]["BatchUpdateBookmarkItem"][] =
            [];
        let errorCount = 0;

        for (let i = 0; i < aniDataToSync.length; i += batchSize) {
            const batch = aniDataToSync
                .slice(i, i + batchSize)
                .map((item) => item.media.id);

            await new Promise((resolve) => setTimeout(resolve, 500));

            const { data, error } = await client.POST("/v2/manga/ani/batch", {
                body: { aniIds: batch },
            });

            if (error || !data) {
                console.error("Error fetching manga batch:", error);
                errorCount++;
                continue;
            }

            for (const manga of data.data) {
                const aniItem = aniDataToSync.find(
                    (item) => item.media.id === manga.aniId,
                );
                if (aniItem) {
                    updateItems.push({
                        mangaId: manga.id,
                        chapterNumber: aniItem.progress ?? 0,
                    });
                }
            }
        }

        if (updateItems.length === 0) {
            new Toast("Sync failed", "error", {
                description: "Could not find matching manga in database",
            });
            return;
        }

        const bookmarkBatchSize = 100;
        let bookmarkErrorCount = 0;

        for (let i = 0; i < updateItems.length; i += bookmarkBatchSize) {
            const batch = updateItems.slice(i, i + bookmarkBatchSize);

            await new Promise((resolve) => setTimeout(resolve, 500));

            const { error } = await client.POST("/v2/bookmarks/batch", {
                body: { items: batch },
            });

            if (error) {
                console.error("Error batch updating bookmarks:", error);
                bookmarkErrorCount++;
            }
        }

        if (bookmarkErrorCount > 0 || errorCount > 0) {
            new Toast("Sync completed with errors", "warning", {
                description: `Synced ${updateItems.length - bookmarkErrorCount} manga, ${errorCount + bookmarkErrorCount} errors occurred`,
            });
        } else {
            new Toast("Sync completed successfully", "success", {
                description: `Successfully synced ${updateItems.length} manga to bookmarks`,
            });
        }
    }

    const loading = aniLoading || bookmarksLoading;
    const progress = bookmarksProgress;

    const renderRow = (item: components["schemas"]["AniEntry"]) => (
        <TableRow key={item.media.id}>
            <TableCell className="font-medium max-w-xs truncate">
                {item.media.title.english || "Unknown Title"}
            </TableCell>
            <TableCell>{item.progress}</TableCell>
            <TableCell className="min-w-[100px]">
                <Badge variant={getStatusVariant(item.status)}>
                    {item.status || "Unknown"}
                </Badge>
            </TableCell>
            <TableCell className="w-12">
                {bookmarks.some(
                    (bookmark) => bookmark.aniId === item.media.id,
                ) ? (
                    <Check className="h-4 w-4 text-green-600" />
                ) : (
                    <X className="h-4 w-4 text-gray-400" />
                )}
            </TableCell>
        </TableRow>
    );

    return (
        <SyncBody
            title="ANI Sync"
            loading={loading}
            progress={progress}
            buttonText="Sync to Bookmarks"
            onButtonClick={syncAniToBookmarks}
            tableHeaders={["Name", "Chapters Read", "Status", "Bookmarked"]}
            renderRow={renderRow}
            data={aniData}
        />
    );
}
