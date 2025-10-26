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

    const getButtonText = () => {
        if (isLoading) return "Loading...";
        if (!hasChapters) return "No Chapters";
        if (data && `chapter-${data.id}` === manga.chapters[0]?.id)
            return "Up To Date";
        if (data) return "Continue Reading";
        return "Start Reading";
    };

    const text = getButtonText();
    const link = data
        ? `chapter-${data.number}`
        : manga.chapters[manga.chapters.length - 1]?.number;

    return (
        <Button
            size="lg"
            className="w-full xl:flex-1"
            disabled={isDisabled}
            asChild={hasChapters}
        >
            {hasChapters ? (
                <Link href={`./${manga.id}/${link}`}>{text}</Link>
            ) : (
                <p>{text}</p>
            )}
        </Button>
    );
};

export default ReadingButton;
