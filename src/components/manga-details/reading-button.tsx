"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Manga } from "@/types/manga";
import { useQuery } from "@tanstack/react-query";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";

interface ReadingButtonProps {
    manga: Manga;
}

const ReadingButton: React.FC<ReadingButtonProps> = ({ manga }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["last-read", manga.identifier],
        queryFn: () => getLatestReadChapter(manga.identifier),
    });

    const hasChapters = manga.chapterList.length > 0;
    const isDisabled = isLoading || !hasChapters;

    const getButtonText = () => {
        if (isLoading) return "Loading...";
        if (!hasChapters) return "No Chapters";
        if (
            data &&
            `chapter-${data.latestChapter.replaceAll(".", "-")}` ===
                manga.chapterList[0].id
        )
            return "Up To Date";
        if (data) return "Continue Reading";
        return "Start Reading";
    };

    const text = getButtonText();
    const link = data
        ? `chapter-${data.latestChapter.replaceAll(".", "-")}`
        : manga.chapterList[manga.chapterList.length - 1].id;

    return (
        <Button
            size="lg"
            className="w-full xl:flex-1"
            disabled={isDisabled}
            asChild={hasChapters}
        >
            {hasChapters ? (
                <Link href={`./${manga.identifier}/${link}`}>{text}</Link>
            ) : (
                <p>{text}</p>
            )}
        </Button>
    );
};

export default ReadingButton;
