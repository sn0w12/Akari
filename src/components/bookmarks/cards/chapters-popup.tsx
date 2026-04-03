"use client";
"use no memo";

import { Button } from "@/components/ui/button";
import {
    PopoverDrawer,
    PopoverDrawerContent,
    PopoverDrawerTrigger,
} from "@/components/ui/popover-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/api";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronsUpDownIcon } from "lucide-react";
import Link from "next/link";
import React, { memo, useMemo, useRef } from "react";

interface ChaptersPopupProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    mangaId: string;
    title: string;
    lastReadChapter: components["schemas"]["MangaChapter"];
    estimatedChapters: number;
    scanlatorId: number;
}

export const ChaptersPopup: React.FC<ChaptersPopupProps> = ({
    open,
    setOpen,
    mangaId,
    title,
    lastReadChapter,
    estimatedChapters,
    scanlatorId,
}) => {
    const { data, isLoading } = useQuery({
        queryKey: ["chapters", mangaId],
        enabled: open,
        queryFn: async () => {
            const { data, error } = await client.GET(
                "/v2/manga/{id}/chapters",
                {
                    params: {
                        path: {
                            id: mangaId,
                        },
                    },
                },
            );

            if (error) {
                throw new Error("Failed to load chapters");
            }

            return data.data;
        },
    });

    const filteredChapters = useMemo(() => {
        if (!data?.chapters) return [];
        return data.chapters.filter((c) => c.scanlatorId === scanlatorId);
    }, [data, scanlatorId]);

    return (
        <PopoverDrawer open={open} onOpenChange={setOpen}>
            <PopoverDrawerTrigger>
                <Button
                    size="sm"
                    className="size-8 hidden md:flex"
                    aria-label="Browse chapters"
                >
                    <ChevronsUpDownIcon className="h-5 w-5" />
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent
                popoverClassName="p-2"
                popoverAlign="end"
                drawerTitle={title}
            >
                {open ? (
                    <ChaptersList
                        isLoading={isLoading}
                        chapters={filteredChapters}
                        estimatedChapters={estimatedChapters}
                        mangaId={mangaId}
                        lastReadChapter={lastReadChapter}
                    />
                ) : null}
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
};

interface ChaptersListProps {
    isLoading: boolean;
    chapters: components["schemas"]["MangaChapter"][];
    estimatedChapters: number;
    mangaId: string;
    lastReadChapter: components["schemas"]["MangaChapter"];
}

function ChaptersList({
    isLoading,
    chapters,
    estimatedChapters,
    mangaId,
    lastReadChapter,
}: ChaptersListProps): React.JSX.Element {
    const parentRef = useRef<HTMLDivElement | null>(null);
    const rowVirtualizer = useVirtualizer({
        count: chapters.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36,
        overscan: 6,
    });

    return (
        <div
            ref={parentRef}
            className="h-96 overflow-y-auto md:h-64"
            data-scrollbar-custom
        >
            {isLoading ? (
                <div className="space-y-2 py-2">
                    {Array(estimatedChapters < 10 ? estimatedChapters : 10)
                        .fill(0)
                        .map((_, index) => (
                            <div key={index} className="p-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                </div>
            ) : chapters.length > 0 ? (
                <div
                    className="relative w-full"
                    style={{ height: rowVirtualizer.getTotalSize() }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const chapter = chapters[virtualRow.index];

                        return (
                            <div
                                key={chapter.id}
                                data-index={virtualRow.index}
                                ref={rowVirtualizer.measureElement}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                <ChapterRow
                                    chapter={chapter}
                                    mangaId={mangaId}
                                    isLastRead={chapter.id === lastReadChapter?.id}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-4 text-center text-muted-foreground">
                    No chapters available
                </div>
            )}
        </div>
    );
}

interface ChapterRowProps {
    chapter: components["schemas"]["MangaChapter"];
    mangaId: string;
    isLastRead: boolean;
}

const ChapterRow = memo(function ChapterRow({
    chapter,
    mangaId,
    isLastRead,
}: ChapterRowProps): React.JSX.Element {
    return (
        <Link
            href={`/manga/${mangaId}/${chapter.scanlatorId}/${chapter.number}`}
            className={cn(
                "block rounded p-2 text-sm transition-colors duration-100 hover:bg-accent",
                {
                    "bg-accent-positive hover:bg-accent-positive/90 text-white":
                        isLastRead,
                },
            )}
            prefetch={false}
            aria-label={`Read ${chapter.title} ${isLastRead ? "(Last Read)" : ""}`}
            transitionTypes={["transition-forwards"]}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 break-words">{chapter.title}</span>
                <span
                    className={cn(
                        "shrink-0 text-xs",
                        isLastRead ? "text-white" : "text-muted-foreground",
                    )}
                >
                    {formatRelativeDate(chapter.createdAt)}
                </span>
            </div>
        </Link>
    );
});
