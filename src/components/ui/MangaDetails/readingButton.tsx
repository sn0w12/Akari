"use client";

import { Button } from "@/components/ui/button";
import HoverLink from "../hoverLink";
import React from "react";
import { MangaDetails } from "@/app/api/interfaces";

interface ReadingButtonProps {
    manga: MangaDetails;
    lastRead: string;
}

const ReadingButton: React.FC<ReadingButtonProps> = ({ manga, lastRead }) => {
    const getLinkText = () => {
        if (lastRead) {
            if (lastRead === manga.chapterList[0].id) {
                return "Up To Date";
            }
            return "Continue Reading";
        } else {
            return "Start Reading";
        }
    };

    const text = getLinkText();

    if (manga.chapterList.length === 0) {
        return (
            <Button size="lg" className="w-full" asChild disabled>
                <p>No Chapters</p>
            </Button>
        );
    }
    const link = lastRead
        ? lastRead
        : manga.chapterList[manga.chapterList.length - 1].id;

    return (
        <Button
            size="lg"
            className="w-full"
            asChild
            disabled={!manga.chapterList.length}
        >
            {manga.chapterList.length ? (
                <HoverLink href={`${window.location.pathname}/${link}`}>
                    {text}
                </HoverLink>
            ) : (
                <p>No Chapters</p>
            )}
        </Button>
    );
};

export default ReadingButton;
