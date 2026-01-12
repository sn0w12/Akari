"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import ClientPagination from "../ui/pagination/client-pagination";
import { formatRelativeDate } from "@/lib/utils";

interface ChaptersSectionProps {
    manga: components["schemas"]["MangaDetailResponse"];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    lastRead?: string;
    getSortedChapters: () => components["schemas"]["MangaDetailResponse"]["chapters"];
}

export function ChaptersSection({
    manga,
    currentPage,
    setCurrentPage,
    lastRead,
    getSortedChapters,
}: ChaptersSectionProps) {
    const sortedChapters = getSortedChapters();
    const totalPages = Math.ceil(sortedChapters.length / 24);
    const currentChapters = sortedChapters.slice(
        (currentPage - 1) * 24,
        currentPage * 24,
    );

    return (
        <>
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
                                    {formatRelativeDate(
                                        (
                                            chapter as unknown as {
                                                createdAt: string;
                                            }
                                        ).createdAt,
                                    )}
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
