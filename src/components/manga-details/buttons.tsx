"use client";

import BookmarkButton from "./bookmark-button";
import ReadingButton from "./reading-button";
import { useQuery } from "@tanstack/react-query";
import { checkIfBookmarked } from "@/lib/manga/bookmarks";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "@/contexts/user-context";

interface ButtonsProps {
    manga: components["schemas"]["MangaDetailResponse"];
}

export default function Buttons({ manga }: ButtonsProps) {
    const { user } = useUser();
    const { data: isBookmarked, isLoading } = useQuery({
        queryKey: ["bookmark", manga.id],
        queryFn: () => checkIfBookmarked(manga.id),
        enabled: !!manga.id && !!user,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col xl:flex-row gap-4 mt-auto">
                <Skeleton className="h-11 w-full xl:w-1/2" />
                <Skeleton className="h-11 w-full xl:w-1/2" />
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row gap-4 mt-auto">
            {/* Toggle bookmark button based on bookmark status */}
            <BookmarkButton
                manga={manga}
                isBookmarked={isBookmarked ?? false}
            />
            <ReadingButton manga={manga} />
        </div>
    );
}
