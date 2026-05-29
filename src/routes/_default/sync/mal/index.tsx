import { SyncBody } from "@/components/sync/sync-body";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { toastManager } from "@/components/ui/toast";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useEffect, useReducer } from "react";

const ALLOWED_MEDIA_TYPES = ["manga", "manhwa", "manhua"];

type SyncState = {
    malData: components["schemas"]["MalMangaListItem"][];
    bookmarks: components["schemas"]["BookmarkListResponse"]["items"];
    malLoading: boolean;
    bookmarksLoading: boolean;
    bookmarksProgress: number;
};

type SyncAction =
    | { type: "MAL_DATA"; data: components["schemas"]["MalMangaListItem"][] }
    | { type: "MAL_ERROR" }
    | {
          type: "BOOKMARKS";
          data: components["schemas"]["BookmarkListResponse"]["items"];
      }
    | { type: "BOOKMARKS_ERROR" }
    | { type: "BOOKMARKS_PROGRESS"; progress: number };

function syncReducer(state: SyncState, action: SyncAction): SyncState {
    switch (action.type) {
        case "MAL_DATA":
            return { ...state, malData: action.data, malLoading: false };
        case "MAL_ERROR":
            return { ...state, malLoading: false };
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

export const Route = createFileRoute("/_default/sync/mal/")({
    component: SyncMalPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .noCache()
            .private()
            .build(),
    }),
});

function SyncMalPage() {
    const [
        { malData, bookmarks, malLoading, bookmarksLoading, bookmarksProgress },
        dispatch,
    ] = useReducer(syncReducer, {
        malData: [] as components["schemas"]["MalMangaListItem"][],
        bookmarks: [] as components["schemas"]["BookmarkListResponse"]["items"],
        malLoading: true,
        bookmarksLoading: true,
        bookmarksProgress: 0,
    });
    const { confirm } = useConfirm();

    const getStatusVariant = (status: string | null) => {
        switch (status) {
            case "completed":
                return "default";
            case "reading":
                return "secondary";
            case "on_hold":
                return "outline";
            case "dropped":
                return "destructive";
            case "plan_to_read":
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

        async function fetchAllMalList() {
            let allData: components["schemas"]["MalMangaListItem"][] = [];
            let offset: number = 0;

            while (true) {
                if (offset > 0) {
                    await delay(500);
                }
                const { data, error } = await client.GET("/v2/mal/mangalist", {
                    params: {
                        query: {
                            limit: 1000,
                            offset: offset,
                        },
                    },
                });

                if (error || !data) {
                    console.error("Error fetching MAL manga list:", error);
                    dispatch({ type: "MAL_ERROR" });
                    break;
                }

                if (data.data?.data) {
                    allData = [...allData, ...data.data.data];
                }

                const next = data.data?.paging?.next;
                if (!next) {
                    break;
                }

                const url = new URL(next);
                const nextOffset = url.searchParams.get("offset");
                if (!nextOffset) {
                    break;
                }
                offset = parseInt(nextOffset, 10);
            }

            dispatch({
                type: "MAL_DATA",
                data: allData.filter((item) => {
                    return ALLOWED_MEDIA_TYPES.includes(item.node.mediaType);
                }),
            });
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

        void fetchAllMalList();
        void fetchAllBookmarks();

        return () => {
            timeoutIds.forEach((id) => {
                clearTimeout(id);
            });
            timeoutIds.clear();
        };
    }, []);

    async function syncMalToBookmarks() {
        if (malData.length === 0) {
            toastManager.add({ title: "No MAL data to sync", type: "warning" });
            return;
        }

        const confirmed = await confirm({
            title: "Confirm MAL Sync",
            description:
                "Are you sure you want to sync your MAL data to bookmarks?",
            confirmText: "Yes, Sync",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        const malDataToSync = malData.filter((item) => {
            const node = item.node;
            return !bookmarks.some((bookmark) => bookmark.malId === node.id);
        });

        if (malDataToSync.length === 0) {
            toastManager.add({
                title: "All manga already synced",
                type: "info",
                description: "No new manga to sync from your MAL list",
            });
            return;
        }

        const alreadySynced = malData.length - malDataToSync.length;
        toastManager.add({
            title: `Starting sync of ${malDataToSync.length} manga`,
            type: "info",
            description:
                alreadySynced > 0
                    ? `Skipping ${alreadySynced} already synced manga`
                    : undefined,
        });

        const batchSize = 50;
        const updateItems: components["schemas"]["BatchUpdateBookmarkItem"][] =
            [];
        let errorCount = 0;

        const malDataById = new Map(
            malData.map((item) => [item.node.id, item]),
        );
        const malDataToSyncById = new Map(
            malDataToSync.map((item) => [item.node.id, item]),
        );

        const batchPromises = [];
        for (let i = 0; i < malDataToSync.length; i += batchSize) {
            const batchIds = malDataToSync
                .slice(i, i + batchSize)
                .map((item) => item.node.id);
            const batchSet = new Set(batchIds);
            const bookmarkRatings = bookmarks.flatMap((bookmark) => {
                if (!bookmark.malId || !batchSet.has(bookmark.malId)) return [];
                const malItem = malDataById.get(bookmark.malId);
                const rating = malItem?.listStatus?.score;
                if (typeof rating === "number" && rating > 0) {
                    return [{ mangaId: bookmark.mangaId, rating }];
                }
                return [];
            });

            batchPromises.push(
                (async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    const [batchRes, ratingRes] = await Promise.all([
                        client.POST("/v2/manga/mal/batch", {
                            body: { malIds: batchIds },
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
                if (!manga.malId) continue;
                const malItem = malDataToSyncById.get(manga.malId);
                if (malItem) {
                    updateItems.push({
                        mangaId: manga.id,
                        chapterNumber: malItem.listStatus?.numChaptersRead ?? 0,
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

    const loading = malLoading || bookmarksLoading;
    const progress = bookmarksProgress;

    const renderRow = (item: components["schemas"]["MalMangaListItem"]) => (
        <TableRow key={item.node.id}>
            <TableCell className="font-medium max-w-xs truncate">
                <Link
                    className="hover:underline"
                    to="/mal/$malId"
                    params={{ malId: String(item.node.id) }}
                >
                    {item.node.title || "Unknown Title"}
                </Link>
            </TableCell>
            <TableCell>{item.listStatus?.numChaptersRead}</TableCell>
            <TableCell className="min-w-[100px]">
                <Badge
                    variant={getStatusVariant(item.listStatus?.status || null)}
                >
                    {item.listStatus?.status || "Unknown"}
                </Badge>
            </TableCell>
            <TableCell className="w-12">
                {bookmarks.some(
                    (bookmark) => bookmark.malId === item.node.id,
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
            title="MAL Sync"
            loading={loading}
            progress={progress}
            buttonText="Sync to Bookmarks"
            onButtonClick={syncMalToBookmarks}
            tableHeaders={["Name", "Chapters Read", "Status", "Bookmarked"]}
            renderRow={renderRow}
            data={malData}
        />
    );
}
