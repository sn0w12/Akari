"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ClientPagination from "../ui/pagination/client-pagination";
import Toast from "@/lib/toast-wrapper";
import { useQuery } from "@tanstack/react-query";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";
import { formatRelativeDate } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";

interface ChaptersSectionProps {
    manga: components["schemas"]["MangaDetailResponse"];
}

export function ChaptersSection({ manga }: ChaptersSectionProps) {
    const { user } = useUser();
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedChapters, setSortedChapters] = useState<
        components["schemas"]["MangaChapter"][]
    >([]);
    const chaptersPerPage = 24;

    const { data, isLoading } = useQuery({
        queryKey: ["last-read", manga.id],
        queryFn: () => getLatestReadChapter(manga.id),
        enabled: !!manga.id && !!user,
    });

    const lastRead = data?.id;
    const getSortedChapters = useCallback(() => {
        return [...(manga.chapters || [])].sort((a, b) => {
            if (a.number === undefined || b.number === undefined) {
                return 0;
            }
            return sortOrder === "asc"
                ? a.number - b.number
                : b.number - a.number;
        });
    }, [manga.chapters, sortOrder]);

    useEffect(() => {
        const sortedChapters = getSortedChapters();
        setSortedChapters(sortedChapters);
    }, [getSortedChapters]);

    const navigateToLastRead = () => {
        if (!lastRead || !manga) {
            new Toast("No previous reading history found", "error");
            return;
        }
        const chapterIndex = sortedChapters?.findIndex(
            (chapter) => chapter.id === lastRead
        );

        if (chapterIndex === -1 || chapterIndex === undefined) {
            new Toast("Last read chapter not found", "error");
            return;
        }

        const pageNumber = Math.floor(chapterIndex / chaptersPerPage) + 1;
        setCurrentPage(pageNumber);

        setTimeout(() => {
            const chapterElement = document.getElementById(lastRead);
            chapterElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 100);
    };

    const totalPages = Math.ceil(sortedChapters.length / chaptersPerPage);
    const currentChapters = sortedChapters?.slice(
        (currentPage - 1) * chaptersPerPage,
        currentPage * chaptersPerPage
    );

    return (
        <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl font-bold">Chapters</h2>
                <div className="flex gap-2">
                    <Button
                        onClick={navigateToLastRead}
                        className="flex-grow"
                        disabled={isLoading}
                    >
                        Find Latest Read
                    </Button>
                    <Button
                        onClick={() =>
                            setSortOrder((order) =>
                                order === "asc" ? "desc" : "asc"
                            )
                        }
                        className="flex-grow"
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
                    </Button>
                </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {currentChapters?.map((chapter) => (
                    <Link
                        href={`/manga/${manga.id}/${chapter.number}`}
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
                                    className={`font-semibold mb-2 line-clamp-2 ${
                                        chapter.id === lastRead
                                            ? "text-background"
                                            : ""
                                    }`}
                                >
                                    {chapter.title}
                                </h3>
                                <p
                                    className={`text-sm ${
                                        chapter.id === lastRead
                                            ? "text-background"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    Pages: {chapter.pages}
                                </p>
                                <p
                                    className={`text-sm ${
                                        chapter.id === lastRead
                                            ? "text-background"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    Released:{" "}
                                    {formatRelativeDate(chapter.createdAt)}
                                </p>
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
                    className="mb-4"
                />
            )}
        </>
    );
}
