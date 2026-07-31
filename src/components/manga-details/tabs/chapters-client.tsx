import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import { useUser } from "@/hooks/use-user";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpDown, BookOpen, Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonLink } from "../../ui/button-link";
import ClientPagination from "../../ui/pagination/client-pagination";
import {
    Select,
    SelectItem,
    SelectPopup,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { fillChapterGaps } from "@/lib/manga/chapters";
import { Badge } from "../../ui/badge";

interface ChaptersSectionProps {
    mangaId: string;
    preferredScanlator: number;
    scanlators: components["schemas"]["Scanlator"][];
    rawChapters: components["schemas"]["MangaChapter"][];
}

interface ChaptersControlsProps {
    mangaId: string;
    onFindLatestRead: () => void;
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
    scanlatorId: number;
    scanlatorOptions: { value: number; label: string }[];
    setScanlatorId: (id: number) => void;
    isLoading: boolean;
    latestData:
        | components["schemas"]["SuccessResponse_BookmarkDetailResponse"]["data"]
        | undefined
        | null;
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
        <div className="flex gap-2 w-full flex-col lg:flex-row lg:w-auto pointer-events-auto">
            {scanlatorOptions.length > 1 && (
                <Select
                    items={scanlatorOptions}
                    onValueChange={(value) => setScanlatorId(Number(value))}
                    value={scanlatorId}
                >
                    <SelectTrigger className="w-full lg:w-40">
                        <SelectValue placeholder="Select Scanlator" />
                    </SelectTrigger>
                    <SelectPopup align="center">
                        {scanlatorOptions.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectPopup>
                </Select>
            )}
            {latestData ? (
                <Button
                    onClick={onFindLatestRead}
                    className="flex-1 lg:w-40"
                    disabled={!isUserLoading && !user}
                    loading={isLoading || isUserLoading}
                >
                    Find Latest Read
                </Button>
            ) : (
                <ButtonLink
                    to="/manga/$mangaId/$scanlator/$subId"
                    params={
                        {
                            mangaId,
                            scanlator: String(scanlatorId),
                            subId: String(firstChapterNumber),
                        } as never
                    }
                    className="flex-1 lg:w-40"
                >
                    Go to First Chapter
                </ButtonLink>
            )}
            <Button
                onClick={() =>
                    onSortChange(sortOrder === "asc" ? "desc" : "asc")
                }
                className="flex-1 lg:w-40 has-[>svg]:px-4"
            >
                <ArrowUpDown className="size-4" />
                Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
            </Button>
        </div>
    );
}

export function ChaptersSection({
    mangaId,
    preferredScanlator,
    scanlators,
    rawChapters,
}: ChaptersSectionProps) {
    const { data: user } = useUser();
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentScanlatorId, setCurrentScanlatorId] =
        useState<number>(preferredScanlator);
    const [currentPage, setCurrentPage] = useState(1);
    const chapters = useMemo(() => {
        return fillChapterGaps(currentScanlatorId, rawChapters);
    }, [rawChapters, currentScanlatorId]);

    const { data, isLoading } = useQuery({
        queryKey: ["last-read", mangaId],
        queryFn: () => getLatestReadChapter(mangaId),
        enabled: !!mangaId && !!user,
    });

    const lastRead = data?.chapterId;

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

    const getSortedChapters = useCallback(() => {
        return [...(chapters || [])].sort((a, b) => {
            if (a.number === undefined || b.number === undefined) {
                return 0;
            }
            return sortOrder === "asc"
                ? a.number - b.number
                : b.number - a.number;
        });
    }, [chapters, sortOrder]);

    const navigateToLastRead = () => {
        if (!lastRead || !mangaId) {
            toastManager.add({
                title: "No previous reading history found",
                type: "error",
            });
            return;
        }
        const chapterIndex = getSortedChapters().findIndex(
            (chapter) => chapter.id === lastRead,
        );

        if (chapterIndex === -1 || chapterIndex === undefined) {
            toastManager.add({
                title: `Last read chapter (${lastRead}) not found`,
                type: "error",
            });
            return;
        }

        const pageNumber = Math.floor(chapterIndex / 24) + 1;
        setCurrentPage(pageNumber);
        setCurrentScanlatorId(data.scanlatorId ?? 0);

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
        const sortedChapters = getSortedChapters();
        return Math.ceil(sortedChapters.length / 24);
    }, [getSortedChapters]);

    const currentChapters = useMemo(() => {
        const sortedChapters = getSortedChapters();
        return sortedChapters.slice((currentPage - 1) * 24, currentPage * 24);
    }, [getSortedChapters, currentPage]);

    const scanlatorOptions = useMemo(() => {
        const uniqueScanlators = new Map();
        scanlators.forEach((scanlator) => {
            if (!uniqueScanlators.has(scanlator.id)) {
                uniqueScanlators.set(scanlator.id, scanlator.name);
            }
        });
        return Array.from(uniqueScanlators.entries()).map(([id, name]) => ({
            value: id,
            label: name,
        }));
    }, [scanlators]);

    return (
        <div className="relative lg:-top-11 lg:pointer-events-none lg:-mb-11">
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
                    <Card
                        key={chapter.id}
                        className={cn(
                            "h-full transition-colors p-0",
                            chapter.id === lastRead &&
                                "bg-accent-positive hover:bg-accent-positive/70",
                            chapter.id !== lastRead && "hover:bg-card/70",
                            chapter.isGapFill && "border-dashed",
                        )}
                        render={
                            <Link
                                to="/manga/$mangaId/$scanlator/$subId"
                                params={{
                                    mangaId,
                                    scanlator: String(chapter.scanlatorId),
                                    subId: String(chapter.number),
                                }}
                                id={chapter.id}
                            ></Link>
                        }
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
                                    "text-sm text-muted-foreground flex gap-1 items-center",
                                    {
                                        "text-background":
                                            chapter.id === lastRead,
                                    },
                                )}
                            >
                                <BookOpen className="size-3.5" />{" "}
                                {chapter.pages}
                            </p>
                            <div className="flex w-full min-w-0 items-center gap-1">
                                <Released
                                    chapter={chapter}
                                    lastRead={lastRead || undefined}
                                />
                                <Badge
                                    variant={
                                        chapter.scanlatorId ===
                                        currentScanlatorId
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    className="truncate block max-w-full shrink"
                                >
                                    {
                                        scanlators.find(
                                            (scanlator) =>
                                                scanlator.id ===
                                                chapter.scanlatorId,
                                        )?.name
                                    }
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {totalPages > 1 && (
                <ClientPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={setCurrentPage}
                    className="mb-2 md:mb-0 pointer-events-auto"
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
            className={cn(
                "min-w-fit flex-1 overflow-hidden text-nowrap text-sm text-muted-foreground flex items-center gap-1",
                {
                    "text-background": chapter.id === lastRead,
                },
            )}
        >
            <Clock className="size-3.5" />{" "}
            {formatRelativeDate(chapter.createdAt)}
        </p>
    );
}
