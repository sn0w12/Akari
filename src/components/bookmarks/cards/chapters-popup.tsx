import { Button } from "@/components/ui/button";
import {
    ResponsiveModal,
    ResponsiveModalDrawerOnly,
    ResponsiveModalHeader,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTitle,
    ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/api";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronsUpDownIcon } from "lucide-react";
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

    const visibleChapters = useMemo(() => {
        if (!data?.chapters) return [];

        const chaptersByNumber = new Map<
            string,
            components["schemas"]["MangaChapter"]
        >();

        for (const chapter of data.chapters) {
            const key = String(chapter.number);
            const selectedChapter = chaptersByNumber.get(key);

            if (!selectedChapter) {
                chaptersByNumber.set(key, chapter);
                continue;
            }

            if (
                selectedChapter.scanlatorId !== scanlatorId &&
                chapter.scanlatorId === scanlatorId
            ) {
                chaptersByNumber.set(key, chapter);
            }
        }

        return Array.from(chaptersByNumber.values());
    }, [data, scanlatorId]);

    return (
        <ResponsiveModal desktop="popover" open={open} onOpenChange={setOpen}>
            <ResponsiveModalTrigger
                render={
                    <Button size="icon-sm" aria-label="Browse chapters">
                        <ChevronsUpDownIcon className="size-5" />
                    </Button>
                }
            />
            <ResponsiveModalPopup
                align="end"
                side="bottom"
                dialogClassName="min-w-64 w-auto"
            >
                <ResponsiveModalDrawerOnly>
                    <ResponsiveModalHeader>
                        <ResponsiveModalTitle className="text-center">
                            {title}
                        </ResponsiveModalTitle>
                    </ResponsiveModalHeader>
                </ResponsiveModalDrawerOnly>
                <ResponsiveModalPanel scrollable={false}>
                    {open ? (
                        <ChaptersList
                            isLoading={isLoading}
                            chapters={visibleChapters}
                            estimatedChapters={estimatedChapters}
                            mangaId={mangaId}
                            lastReadChapter={lastReadChapter}
                        />
                    ) : null}
                </ResponsiveModalPanel>
            </ResponsiveModalPopup>
        </ResponsiveModal>
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

    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: chapters.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36,
        overscan: 6,
    });

    return (
        <ScrollArea
            ref={parentRef}
            className="h-96 md:h-64"
            scrollFade
            scrollbarGutter
        >
            {isLoading ? (
                <div className="space-y-2 py-2">
                    {Array.from(
                        {
                            length:
                                estimatedChapters < 10 ? estimatedChapters : 10,
                        },
                        (_, i) => i,
                    ).map((i) => (
                        <div key={`skeleton-${i}`} className="p-2">
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
                                    isLastRead={
                                        chapter.id === lastReadChapter?.id
                                    }
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
        </ScrollArea>
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
            to="/manga/$mangaId/$scanlator/$subId"
            params={{
                mangaId,
                scanlator: String(chapter.scanlatorId),
                subId: String(chapter.number),
            }}
            className={cn(
                "block rounded p-2 text-sm transition-colors duration-100 hover:bg-accent",
                {
                    "bg-accent-positive hover:bg-accent-positive/90 text-white":
                        isLastRead,
                },
            )}
            aria-label={`Read ${chapter.title} ${isLastRead ? "(Last Read)" : ""}`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 break-words">{chapter.title}</span>
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
