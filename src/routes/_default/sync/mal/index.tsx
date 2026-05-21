import { createFileRoute, Link } from "@tanstack/react-router";
import { SyncBody } from "@/components/sync/sync-body";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { toastManager } from "@/components/ui/toast";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

const ALLOWED_MEDIA_TYPES = ["manga", "manhwa", "manhua"];

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
    const [malData, setMalData] = useState<
        components["schemas"]["MalMangaListItem"][]
    >([]);
    const [bookmarks, setBookmarks] = useState<
        components["schemas"]["BookmarkListResponse"]["items"]
    >([]);
    const [malLoading, setMalLoading] = useState(true);
    const [bookmarksLoading, setBookmarksLoading] = useState(true);
    const [bookmarksProgress, setBookmarksProgress] = useState(0);
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
        async function fetchAllMalList() {
            let allData: components["schemas"]["MalMangaListItem"][] = [];
            let offset: number = 0;

            while (true) {
                if (offset > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
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
                    setMalLoading(false);
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

            setMalData(
                allData.filter((item) => {
                    return ALLOWED_MEDIA_TYPES.includes(item.node.mediaType);
                }),
            );
            setMalLoading(false);
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

        fetchAllMalList();
        fetchAllBookmarks();
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

        const malDataToSync = malData.filter(
            (item) =>
                !bookmarks.some((bookmark) => bookmark.malId === item.node.id),
        );

        if (malDataToSync.length === 0) {
            toastManager.add({ title: "All manga already synced", type: "info", description: "No new manga to sync from your MAL list" });
            return;
        }

        const alreadySynced = malData.length - malDataToSync.length;
        toastManager.add({ title: `Starting sync of ${malDataToSync.length} manga`, type: "info", description: alreadySynced > 0 ? `Skipping ${alreadySynced} already synced manga` : undefined });

        const batchSize = 50;
        const updateItems: components["schemas"]["BatchUpdateBookmarkItem"][] =
            [];
        let errorCount = 0;

        for (let i = 0; i < malDataToSync.length; i += batchSize) {
            const batch = malDataToSync
                .slice(i, i + batchSize)
                .map((item) => item.node.id);
            const bookmarkRatings = bookmarks
                .filter(
                    (bookmark) =>
                        bookmark.malId && batch.includes(bookmark.malId),
                )
                .map((bookmark) => {
                    const malItem = malData.find(
                        (item) => item.node.id === bookmark.malId,
                    );
                    return {
                        mangaId: bookmark.mangaId,
                        rating: malItem?.listStatus?.score,
                    };
                })
                .filter(
                    (item): item is { mangaId: string; rating: number } =>
                        typeof item.rating === "number" && item.rating > 0,
                );

            await new Promise((resolve) => setTimeout(resolve, 500));

            const { data, error } = await client.POST("/v2/manga/mal/batch", {
                body: { malIds: batch },
            });
            const { data: ratingData, error: ratingError } = await client.POST(
                "/v2/manga/rate/batch",
                {
                    body: { ratings: bookmarkRatings },
                },
            );

            if (error || !data) {
                console.error("Error fetching manga batch:", error);
                errorCount++;
                continue;
            }

            if (ratingError || !ratingData) {
                console.error("Error rating manga batch:", ratingError);
                errorCount++;
                continue;
            }

            for (const manga of data.data) {
                const malItem = malDataToSync.find(
                    (item) => item.node.id === manga.malId,
                );
                if (malItem) {
                    updateItems.push({
                        mangaId: manga.id,
                        chapterNumber: malItem.listStatus?.numChaptersRead ?? 0,
                    });
                }
            }
        }

        if (updateItems.length === 0) {
            toastManager.add({ title: "Sync failed", type: "error", description: "Could not find matching manga in database" });
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
            toastManager.add({ title: "Sync completed with errors", type: "warning", description: `Synced ${updateItems.length - bookmarkErrorCount} manga, ${errorCount + bookmarkErrorCount} errors occurred` });
        } else {
            toastManager.add({ title: "Sync completed successfully", type: "success", description: `Successfully synced ${updateItems.length} manga to bookmarks` });
        }
    }

    const loading = malLoading || bookmarksLoading;
    const progress = bookmarksProgress;

    const renderRow = (item: components["schemas"]["MalMangaListItem"]) => (
        <TableRow key={item.node.id}>
            <TableCell className="font-medium max-w-xs truncate">
                <Link
                    className="hover:underline"
                    to="/mal/$id"
                    params={{ id: String(item.node.id) }}
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
                    <Check className="h-4 w-4 text-green-600" />
                ) : (
                    <X className="h-4 w-4 text-gray-400" />
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
