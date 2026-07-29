import { SyncBody } from "@/components/sync/sync-body";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { toastManager } from "@/components/ui/toast";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { StorageManager } from "@/lib/storage";
import { getTrackerId } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useEffect, useReducer } from "react";

type SyncState = {
    aniData: components["schemas"]["AniEntry"][];
    bookmarks: components["schemas"]["BookmarkResponse"][];
    aniLoading: boolean;
    bookmarksLoading: boolean;
    bookmarksProgress: number;
};

type SyncAction =
    | { type: "ANI_DATA"; data: components["schemas"]["AniEntry"][] }
    | { type: "ANI_ERROR" }
    | {
          type: "BOOKMARKS";
          data: components["schemas"]["BookmarkResponse"][];
      }
    | { type: "BOOKMARKS_ERROR" }
    | { type: "BOOKMARKS_PROGRESS"; progress: number };

function syncReducer(state: SyncState, action: SyncAction): SyncState {
    switch (action.type) {
        case "ANI_DATA":
            return { ...state, aniData: action.data, aniLoading: false };
        case "ANI_ERROR":
            return { ...state, aniLoading: false };
        case "BOOKMARKS":
            return {
                ...state,
                bookmarks: action.data,
                bookmarksLoading: false,
            };
        case "BOOKMARKS_ERROR":
            return { ...state, bookmarksLoading: false };
        case "BOOKMARKS_PROGRESS":
            return { ...state, bookmarksProgress: action.progress };
    }
}

export const Route = createFileRoute("/_default/sync/ani/")({
    component: SyncAniPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .noCache()
            .private()
            .build(),
    }),
});

function SyncAniPage() {
    const [
        { aniData, bookmarks, aniLoading, bookmarksLoading, bookmarksProgress },
        dispatch,
    ] = useReducer(syncReducer, {
        aniData: [] as components["schemas"]["AniEntry"][],
        bookmarks: [] as components["schemas"]["BookmarkResponse"][],
        aniLoading: true,
        bookmarksLoading: true,
        bookmarksProgress: 0,
    });
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
                return "warning";
            default:
                return "outline";
        }
    };

    useEffect(() => {
        const timeoutIds: Set<ReturnType<typeof setTimeout>> = new Set();

        const delay = (ms: number) =>
            new Promise<void>((resolve) => {
                const id = setTimeout(() => {
                    timeoutIds.delete(id);
                    resolve();
                }, ms);
                timeoutIds.add(id);
            });

        async function fetchAllAniList() {
            const aniListUserStorage = StorageManager.get("aniListUser");
            const userName = aniListUserStorage.get()?.name;
            if (!userName) {
                console.error("No AniList username found in storage");
                dispatch({ type: "ANI_ERROR" });
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
                dispatch({ type: "ANI_ERROR" });
                return;
            }

            dispatch({ type: "ANI_DATA", data: data?.data.lists[0].entries });
        }

        async function fetchAllBookmarks() {
            let allData: components["schemas"]["BookmarkResponse"][] = [];
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
                    dispatch({ type: "BOOKMARKS_ERROR" });
                    break;
                }

                const d = data.data;
                if (d?.items) {
                    allData = [...allData, ...d.items];
                }

                if (!totalPages && d?.totalPages) {
                    totalPages = d.totalPages;
                }

                if (totalPages) {
                    dispatch({
                        type: "BOOKMARKS_PROGRESS",
                        progress: (page / totalPages) * 100,
                    });
                }

                if (page >= (d?.totalPages || 0)) {
                    break;
                }
                page += 1;
                await delay(500);
            }

            dispatch({ type: "BOOKMARKS", data: allData });
        }

        void fetchAllAniList();
        void fetchAllBookmarks();

        return () => {
            timeoutIds.forEach((id) => {
                clearTimeout(id);
            });
            timeoutIds.clear();
        };
    }, []);

    async function syncAniToBookmarks() {
        if (aniData.length === 0) {
            toastManager.add({
                title: "No AniList data to sync",
                type: "warning",
            });
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

        const aniDataToSync = aniData.filter((item) => {
            const media = item.media;
            return !bookmarks.some(
                (bookmark) =>
                    Number(getTrackerId(bookmark.trackers, "anilist")) ===
                    media.id,
            );
        });

        if (aniDataToSync.length === 0) {
            toastManager.add({
                title: "All manga already synced",
                type: "info",
                description: "No new manga to sync from your AniList",
            });
            return;
        }

        const alreadySynced = aniData.length - aniDataToSync.length;
        toastManager.add({
            title: `Starting sync of ${aniDataToSync.length} manga`,
            type: "info",
            description:
                alreadySynced > 0
                    ? `Skipping ${alreadySynced} already synced manga`
                    : undefined,
        });

        const batchSize = 50;
        const updateItems: components["schemas"]["BookmarkBatchBody"]["items"] =
            [];
        let errorCount = 0;

        const aniDataById = new Map(
            aniData.map((item) => [item.media.id, item]),
        );
        const aniDataToSyncById = new Map(
            aniDataToSync.map((item) => [item.media.id, item]),
        );

        const batchPromises = [];
        for (let i = 0; i < aniDataToSync.length; i += batchSize) {
            const batchIds = aniDataToSync
                .slice(i, i + batchSize)
                .map((item) => item.media.id);
            const batchSet = new Set(batchIds);
            const bookmarkRatings = bookmarks.flatMap((bookmark) => {
                const aniId = Number(
                    getTrackerId(bookmark.trackers, "anilist"),
                );
                if (!aniId || !batchSet.has(aniId)) return [];
                const aniItem = aniDataById.get(aniId);
                const rating = aniItem?.score;
                if (typeof rating === "number" && rating > 0) {
                    return [{ mangaId: bookmark.mangaId, rating }];
                }
                return [];
            });

            batchPromises.push(
                (async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    const [batchRes, ratingRes] = await Promise.all([
                        client.POST("/v2/manga/ani/batch", {
                            body: { aniIds: batchIds },
                        }),
                        client.POST("/v2/manga/rate/batch", {
                            body: { ratings: bookmarkRatings },
                        }),
                    ]);

                    const { data, error } = batchRes;
                    const { data: ratingData, error: ratingError } = ratingRes;

                    if (error || !data) {
                        console.error("Error fetching manga batch:", error);
                        errorCount++;
                        return null;
                    }

                    if (ratingError || !ratingData) {
                        console.error("Error rating manga batch:", ratingError);
                        errorCount++;
                        return null;
                    }

                    return data.data;
                })(),
            );
        }

        const batchResults = await Promise.all(batchPromises);

        for (const data of batchResults) {
            if (!data) continue;
            for (const manga of data) {
                const aniId = Number(getTrackerId(manga.trackers, "anilist"));
                if (!aniId) continue;
                const aniItem = aniDataToSyncById.get(aniId);
                if (aniItem) {
                    updateItems.push({
                        mangaId: manga.id,
                        chapterNumber: aniItem.progress ?? 0,
                    });
                }
            }
        }

        if (updateItems.length === 0) {
            toastManager.add({
                title: "Sync failed",
                type: "error",
                description: "Could not find matching manga in database",
            });
            return;
        }

        const bookmarkBatchSize = 100;
        let bookmarkErrorCount = 0;

        const bookmarkPromises = [];
        for (let i = 0; i < updateItems.length; i += bookmarkBatchSize) {
            const batch = updateItems.slice(i, i + bookmarkBatchSize);

            bookmarkPromises.push(
                (async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    const { error } = await client.POST("/v2/bookmarks/batch", {
                        body: { items: batch },
                    });

                    if (error) {
                        console.error("Error batch updating bookmarks:", error);
                        return false;
                    }
                    return true;
                })(),
            );
        }

        const bookmarkResults = await Promise.all(bookmarkPromises);
        bookmarkErrorCount = bookmarkResults.filter((r) => !r).length;

        if (bookmarkErrorCount > 0 || errorCount > 0) {
            toastManager.add({
                title: "Sync completed with errors",
                type: "warning",
                description: `Synced ${updateItems.length - bookmarkErrorCount} manga, ${errorCount + bookmarkErrorCount} errors occurred`,
            });
        } else {
            toastManager.add({
                title: "Sync completed successfully",
                type: "success",
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
                    (bookmark) =>
                        Number(getTrackerId(bookmark.trackers, "anilist")) ===
                        item.media.id,
                ) ? (
                    <Check className="size-4 text-green-600" />
                ) : (
                    <X className="size-4 text-gray-400" />
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
