"use client";

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
import { ChevronsUpDownIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ChaptersPopupProps {
    mangaId: string;
    title: string;
    lastReadChapter: components["schemas"]["MangaChapter"];
}

export const ChaptersPopup: React.FC<ChaptersPopupProps> = ({
    mangaId,
    title,
    lastReadChapter,
}) => {
    const [open, setOpen] = useState(false);
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

    return (
        <PopoverDrawer open={open} onOpenChange={setOpen}>
            <PopoverDrawerTrigger>
                <Button
                    size="sm"
                    className="size-8"
                    aria-label="Browse chapters"
                >
                    <ChevronsUpDownIcon className="h-5 w-5" />
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent popoverAlign="end">
                <div className="flex items-center mb-1 pb-1 border-b gap-1 justify-center md:justify-start">
                    <h4 className="font-semibold">{title}</h4>
                </div>
                <div
                    className="max-h-96 md:max-h-64 overflow-y-auto"
                    data-scrollbar-custom
                >
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
                                                },
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
                                                            : "text-muted-foreground",
                                                    )}
                                                >
                                                    {formatRelativeDate(
                                                        chapter.createdAt,
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
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
};
