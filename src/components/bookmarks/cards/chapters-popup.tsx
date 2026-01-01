"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ChaptersPopupProps {
    mangaId: string;
    lastReadChapter?: components["schemas"]["MangaChapter"];
}

export const ChaptersPopup: React.FC<ChaptersPopupProps> = ({
    mangaId,
    lastReadChapter,
}) => {
    const { data, isLoading } = useQuery({
        queryKey: ["chapters", mangaId],
        queryFn: async () => {
            const { data, error } = await client.GET(
                "/v2/manga/{id}/chapters",
                {
                    params: {
                        path: {
                            id: mangaId,
                        },
                    },
                }
            );

            if (error) {
                throw new Error("Failed to load chapters");
            }

            return data.data;
        },
    });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="w-10 p-0" aria-label="Browse chapters">
                    <ChevronsUpDownIcon className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
                <div className="flex justify-between items-center mb-1 pb-1 border-b">
                    <h4 className="font-semibold px-2">Chapters</h4>
                </div>
                <div className="max-h-64 overflow-y-auto" data-scrollbar-custom>
                    {isLoading ? (
                        <div className="space-y-2 py-2">
                            {Array(5)
                                .fill(0)
                                .map((_, index) => (
                                    <div key={index} className="p-2">
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : data && data.length > 0 ? (
                        <ul className="space-y-1">
                            {data.map((chapter) => {
                                const isLastRead =
                                    chapter.id === lastReadChapter?.id;
                                return (
                                    <li key={chapter.id}>
                                        <Link
                                            href={`/manga/${mangaId}/${chapter.number}`}
                                            className={cn(
                                                "block p-2 rounded text-sm transition-colors duration-100 hover:bg-accent",
                                                {
                                                    "bg-accent-positive hover:bg-accent-positive/90 text-white":
                                                        isLastRead,
                                                }
                                            )}
                                            prefetch={false}
                                            aria-label={`Read ${
                                                chapter.title
                                            } ${
                                                isLastRead ? "(Last Read)" : ""
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{chapter.title}</span>
                                                <span
                                                    className={cn(
                                                        "text-xs",
                                                        isLastRead
                                                            ? "text-white"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {formatRelativeDate(
                                                        chapter.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No chapters available
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
