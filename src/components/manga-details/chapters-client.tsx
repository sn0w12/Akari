"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";
import Toast from "@/lib/toast-wrapper";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ButtonLink } from "../ui/button-link";
import ClientPagination from "../ui/pagination/client-pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface ChaptersSectionProps {
    mangaId: string;
    preferredScanlator: number;
    scanlators: components["schemas"]["Scanlator"][];
    chapters: components["schemas"]["MangaChapter"][];
}

interface ChaptersControlsProps {
    mangaId: string;
    onFindLatestRead: () => void;
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
    scanlatorId: number;
    scanlatorOptions: { id: number; name: string }[];
    setScanlatorId: (id: number) => void;
    isLoading: boolean;
    latestData: components["schemas"]["LastReadResponse"] | undefined | null;
    firstChapterNumber: number;
}

function ChaptersControls({
    mangaId,
    onFindLatestRead,
    sortOrder,
    onSortChange,
    scanlatorId,
    scanlatorOptions,
    setScanlatorId,
    isLoading,
    latestData,
    firstChapterNumber,
}: ChaptersControlsProps) {
    const { data: user, isLoading: isUserLoading } = useUser();

    return (
        <div className="flex gap-2 w-full flex-col md:flex-row md:w-auto pointer-events-auto">
            <Select
                onValueChange={(value) => setScanlatorId(Number(value))}
                value={scanlatorId.toString()}
            >
                <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Select Scanlator" />
                </SelectTrigger>
                <SelectContent align="center">
                    {scanlatorOptions.map((option) => (
                        <SelectItem
                            key={option.id}
                            value={option.id.toString()}
                        >
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex gap-2 w-full">
                {isLoading || isUserLoading ? (
                    <Button className="flex-1 md:w-40" disabled />
                ) : latestData ? (
                    <Button
                        onClick={onFindLatestRead}
                        className="flex-1 md:w-40"
                        disabled={isLoading || !user}
                    >
                        Find Latest Read
                    </Button>
                ) : (
                    <ButtonLink
                        href={`/manga/${mangaId}/${firstChapterNumber}`}
                        className="flex-1 md:w-40"
                    >
                        Go to First Chapter
                    </ButtonLink>
                )}
                <Button
                    onClick={() =>
                        onSortChange(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="flex-1 md:w-40 has-[>svg]:px-4"
                >
                    <ArrowUpDown className="h-4 w-4" />
                    Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
                </Button>
            </div>
        </div>
    );
}

export function ChaptersSection({
    mangaId,
    preferredScanlator,
    scanlators,
    chapters,
}: ChaptersSectionProps) {
    const { data: user } = useUser();
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentScanlatorId, setCurrentScanlatorId] =
        useState<number>(preferredScanlator);
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["last-read", mangaId],
        queryFn: () => getLatestReadChapter(mangaId),
        enabled: !!mangaId && !!user,
    });

    const lastRead = data?.id;

    useEffect(() => {
        if (!data) return;
        const lastReadChapter = chapters.find(
            (chapter) => chapter.id === data.id,
        );
        if (!lastReadChapter || !lastReadChapter?.scanlatorId) return;

        queueMicrotask(() => {
            setCurrentScanlatorId(lastReadChapter.scanlatorId);
        });
    }, [data, chapters]);

    const getSortedChapters = useCallback(
        (scanlatorId: number) => {
            return [...(chapters || [])]
                .filter((chapter) => chapter.scanlatorId === scanlatorId)
                .sort((a, b) => {
                    if (a.number === undefined || b.number === undefined) {
                        return 0;
                    }
                    return sortOrder === "asc"
                        ? a.number - b.number
                        : b.number - a.number;
                });
        },
        [chapters, sortOrder],
    );

    const navigateToLastRead = () => {
        if (!lastRead || !mangaId) {
            new Toast("No previous reading history found", "error");
            return;
        }
        const chapterIndex = getSortedChapters(data.scanlatorId).findIndex(
            (chapter) => chapter.id === lastRead,
        );

        if (chapterIndex === -1 || chapterIndex === undefined) {
            new Toast("Last read chapter not found", "error");
            return;
        }

        const pageNumber = Math.floor(chapterIndex / 24) + 1;
        setCurrentPage(pageNumber);
        setCurrentScanlatorId(data.scanlatorId);

        setTimeout(() => {
            const chapterElement = document.getElementById(lastRead);
            chapterElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 100);
    };
    const firstChapterNumber = useMemo(() => {
        if (!chapters || chapters.length === 0) {
            return 1;
        }
        return chapters[chapters.length - 1].number;
    }, [chapters]);

    const totalPages = useMemo(() => {
        const sortedChapters = getSortedChapters(currentScanlatorId);
        return Math.ceil(sortedChapters.length / 24);
    }, [getSortedChapters, currentScanlatorId]);

    const currentChapters = useMemo(() => {
        const sortedChapters = getSortedChapters(currentScanlatorId);
        return sortedChapters.slice((currentPage - 1) * 24, currentPage * 24);
    }, [getSortedChapters, currentScanlatorId, currentPage]);

    const scanlatorOptions = useMemo(() => {
        const uniqueScanlators = new Map();
        scanlators.forEach((scanlator) => {
            if (!uniqueScanlators.has(scanlator.id)) {
                uniqueScanlators.set(scanlator.id, scanlator.name);
            }
        });
        return Array.from(uniqueScanlators.entries()).map(([id, name]) => ({
            id,
            name,
        }));
    }, [scanlators]);

    return (
        <div className="relative md:-top-11 md:pointer-events-none md:-mb-11">
            <div className="flex justify-end mb-2">
                <ChaptersControls
                    mangaId={mangaId}
                    onFindLatestRead={navigateToLastRead}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    scanlatorId={currentScanlatorId}
                    setScanlatorId={setCurrentScanlatorId}
                    scanlatorOptions={scanlatorOptions}
                    isLoading={isLoading}
                    latestData={data}
                    firstChapterNumber={firstChapterNumber}
                />
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-4 pointer-events-auto">
                {currentChapters?.map((chapter) => (
                    <Link
                        href={`/manga/${mangaId}/${chapter.number}`}
                        key={chapter.id}
                        id={chapter.id}
                        prefetch={false}
                    >
                        <Card
                            className={`h-full transition-colors p-0 ${
                                chapter.id === lastRead
                                    ? "bg-accent-positive hover:bg-accent-positive/70"
                                    : "hover:bg-accent"
                            }`}
                        >
                            <CardContent className="p-4">
                                <h3
                                    className={cn(
                                        "font-semibold mb-2 line-clamp-2",
                                        {
                                            "text-background":
                                                chapter.id === lastRead,
                                        },
                                    )}
                                >
                                    {chapter.title}
                                </h3>
                                <p
                                    className={cn(
                                        "text-sm text-muted-foreground",
                                        {
                                            "text-background":
                                                chapter.id === lastRead,
                                        },
                                    )}
                                >
                                    Pages: {chapter.pages}
                                </p>
                                <Suspense fallback={null}>
                                    <Released
                                        chapter={chapter}
                                        lastRead={lastRead}
                                    />
                                </Suspense>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {totalPages > 1 && (
                <ClientPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={setCurrentPage}
                    className="mb-4 md:mb-0 pointer-events-auto"
                />
            )}
        </div>
    );
}

function Released({
    chapter,
    lastRead,
}: {
    chapter: components["schemas"]["MangaChapter"];
    lastRead: string | undefined;
}) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", {
                "text-background": chapter.id === lastRead,
            })}
        >
            Released: {formatRelativeDate(chapter.createdAt)}
        </p>
    );
}
