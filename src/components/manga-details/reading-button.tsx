"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";

interface ReadingButtonProps {
    manga: components["schemas"]["MangaDetailResponse"];
}

const ReadingButton: React.FC<ReadingButtonProps> = ({ manga }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["last-read", manga.id],
        queryFn: () => getLatestReadChapter(manga.id),
    });

    const hasChapters = manga.chapters.length > 0;
    const isDisabled = isLoading || !hasChapters;

    function getButtonInfo(): { text: string; link: number | null } {
        if (isLoading) return { text: "Loading...", link: null };
        if (!hasChapters) return { text: "No Chapters", link: null };
        if (data && data.id === manga.chapters[manga.chapters.length - 1].id)
            return {
                text: "Up To Date",
                link: manga.chapters[manga.chapters.length - 1].number,
            };
        if (data) return { text: "Continue Reading", link: data.number };
        return {
            text: "Start Reading",
            link: manga.chapters[0].number,
        };
    }

    const { text, link } = getButtonInfo();

    return (
        <Button
            size="lg"
            className="w-full xl:flex-1"
            disabled={isDisabled}
            asChild={hasChapters}
        >
            {hasChapters ? (
                <Link href={link ? `./${manga.id}/${link}` : ""}>{text}</Link>
            ) : (
                <p>{text}</p>
            )}
        </Button>
    );
};

export default ReadingButton;
