"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ChaptersSection } from "./chapters";
import { MangaGrid } from "../manga/manga-grid";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Toast from "@/lib/toast-wrapper";
import { useQuery } from "@tanstack/react-query";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";
import { useUser } from "@/contexts/user-context";

interface ChaptersControlsProps {
    onFindLatestRead: () => void;
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
    isLoading: boolean;
}

function ChaptersControls({
    onFindLatestRead,
    sortOrder,
    onSortChange,
    isLoading,
}: ChaptersControlsProps) {
    return (
        <div className="flex gap-2">
            <Button
                onClick={onFindLatestRead}
                className="flex-grow"
                disabled={isLoading}
            >
                Find Latest Read
            </Button>
            <Button
                onClick={() =>
                    onSortChange(sortOrder === "asc" ? "desc" : "asc")
                }
                className="flex-grow"
            >
                <ArrowUpDown className="h-4 w-4" />
                Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
            </Button>
        </div>
    );
}

export function MangaDetailsBody({
    manga,
    rec,
}: {
    manga: components["schemas"]["MangaDetailResponse"];
    rec: components["schemas"]["MangaResponse"][];
}) {
    const { user } = useUser();
    const [tabValue, setTabValue] = useState("chapters");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);

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

    const navigateToLastRead = () => {
        if (!lastRead || !manga) {
            new Toast("No previous reading history found", "error");
            return;
        }
        const chapterIndex = getSortedChapters().findIndex(
            (chapter) => chapter.id === lastRead
        );

        if (chapterIndex === -1 || chapterIndex === undefined) {
            new Toast("Last read chapter not found", "error");
            return;
        }

        const pageNumber = Math.floor(chapterIndex / 24) + 1;
        setCurrentPage(pageNumber);

        setTimeout(() => {
            const chapterElement = document.getElementById(lastRead);
            chapterElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 100);
    };

    return (
        <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            defaultValue="chapters"
            className="w-full"
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <TabsList className="bg-background p-0 gap-2">
                    <TabsTrigger
                        className="text-xl md:text-2xl font-bold px-0 border-0 data-[state=active]:bg-background dark:data-[state=active]:bg-background"
                        value="chapters"
                    >
                        Chapters
                    </TabsTrigger>
                    <TabsTrigger
                        className="text-xl md:text-2xl font-bold px-0 border-0 data-[state=active]:bg-background dark:data-[state=active]:bg-background"
                        value="recommendations"
                    >
                        Recommendations
                    </TabsTrigger>
                </TabsList>
                {tabValue === "chapters" && (
                    <ChaptersControls
                        onFindLatestRead={navigateToLastRead}
                        sortOrder={sortOrder}
                        onSortChange={setSortOrder}
                        isLoading={isLoading}
                    />
                )}
            </div>

            <TabsContent value="chapters">
                <ChaptersSection
                    manga={manga}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastRead={lastRead}
                    getSortedChapters={getSortedChapters}
                />
            </TabsContent>

            <TabsContent value="recommendations">
                <MangaGrid mangaList={rec} />
            </TabsContent>
        </Tabs>
    );
}
