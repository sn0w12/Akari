"use client";

import { useUser } from "@/contexts/user-context";
import { checkIfBookmarked } from "@/lib/manga/bookmarks";
import { useQuery } from "@tanstack/react-query";
import { ListSelector } from "../list/list-selector";
import { Skeleton } from "../ui/skeleton";
import BookmarkButton from "./bookmark-button";

interface ButtonsProps {
    manga: components["schemas"]["MangaResponse"];
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
            <div className="flex flex-col xl:flex-row gap-2">
                <Skeleton className="h-11 w-full xl:w-1/2" />
                <Skeleton className="h-11 w-full xl:w-1/2" />
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row gap-2">
            <BookmarkButton
                manga={manga}
                isBookmarked={isBookmarked ?? false}
            />
            <ListSelector mangaId={manga.id} />
        </div>
    );
}
