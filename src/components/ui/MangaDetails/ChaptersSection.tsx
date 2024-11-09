"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PaginationElement from "@/components/ui/Pagination/ClientPaginationElement";
import db from "@/lib/db";
import { debounce } from "lodash";
import { Manga } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";

interface ChaptersSectionProps {
    manga: Manga;
}

export function ChaptersSection({ manga }: ChaptersSectionProps) {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [lastRead, setLastRead] = useState<string>("");
    const chaptersPerPage = 24;
    const id = manga.identifier;

    const loadManga = useCallback(async () => {
        const cachedData = await db.getCache(db.mangaCache, id);

        if (cachedData) {
            setLastRead(cachedData.last_read);
        } else {
            db.updateCache(db.mangaCache, id, { id: manga.mangaId });
        }
    }, [id]);

    const debouncedLoadManga = useCallback(debounce(loadManga, 10), [
        loadManga,
    ]);

    useEffect(() => {
        debouncedLoadManga();

        // Cleanup debounce on unmount
        return () => {
            debouncedLoadManga.cancel();
        };
    }, [debouncedLoadManga, manga]);

    const sortedChapters = manga?.chapterList.filter((chapter, index, self) => {
        const ids = self.map((ch) => ch.id);
        return ids.indexOf(chapter.id) === index;
    });

    const navigateToLastRead = () => {
        if (!lastRead || !manga) {
            new Toast("No previous reading history found", "error");
            return;
        }
        const chapterIndex = sortedChapters?.findIndex(
            (chapter) => chapter.id === lastRead,
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

    const formatChapterDate = (date: string) => {
        const dateArray = date.split(",");
        return `${dateArray[0]}, ${dateArray[1].split(" ").shift()}`;
    };

    const totalPages = Math.ceil(sortedChapters.length / chaptersPerPage);
    const currentChapters = sortedChapters?.slice(
        (currentPage - 1) * chaptersPerPage,
        currentPage * chaptersPerPage,
    );

    return (
        <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl font-bold">Chapters</h2>
                <div className="flex gap-2">
                    <Button onClick={navigateToLastRead}>
                        Find Latest Read
                    </Button>
                    <Button
                        onClick={() =>
                            setSortOrder((order) =>
                                order === "asc" ? "desc" : "asc",
                            )
                        }
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
                    </Button>
                </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {currentChapters?.map((chapter) => (
                    <Link
                        href={`/manga/${manga.identifier}/${chapter.id}`}
                        key={chapter.id}
                        id={chapter.id}
                    >
                        <Card
                            className={`h-full transition-colors ${
                                chapter.id === lastRead
                                    ? "bg-green-500 hover:bg-green-400"
                                    : "hover:bg-accent"
                            }`}
                        >
                            <CardContent className="p-4">
                                <h3
                                    className={`font-semibold mb-2 line-clamp-2 ${
                                        chapter.id === lastRead
                                            ? "text-zinc-950"
                                            : ""
                                    }`}
                                >
                                    {chapter.name}
                                </h3>
                                <p
                                    className={`text-sm text-muted-foreground ${
                                        chapter.id === lastRead
                                            ? "text-zinc-900"
                                            : ""
                                    }`}
                                >
                                    Views: {chapter.view}
                                </p>
                                <p
                                    className={`text-sm text-muted-foreground ${
                                        chapter.id === lastRead
                                            ? "text-zinc-900"
                                            : ""
                                    }`}
                                >
                                    Released:{" "}
                                    {formatChapterDate(chapter.createdAt)}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {totalPages > 1 && (
                <PaginationElement
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={setCurrentPage}
                />
            )}
        </>
    );
}
