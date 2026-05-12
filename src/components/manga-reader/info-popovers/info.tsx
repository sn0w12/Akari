"use client";

import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";

import BookmarkButton from "@/components/manga-details/bookmark-button";
import { Button } from "../../ui/button";
import { ButtonLink } from "../../ui/button-link";
import {
    PopoverDrawer,
    PopoverDrawerContent,
    PopoverDrawerTrigger,
} from "../../ui/popover-drawer";
import { ChapterSelector } from "../chapter-selector";

export function InfoContent({
    chapter,
    scanlator,
}: {
    chapter: components["schemas"]["ChapterResponse"];
    scanlator: string;
}) {
    const lastChapterExists = chapter.lastChapter !== null;
    const nextChapterExists = chapter.nextChapter !== null;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-lg font-bold leading-tight text-center md:text-left">
                    <Link
                        to="/manga/$id"
                        params={{ id: chapter.mangaId }}
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        {chapter.mangaTitle}
                    </Link>
                </h2>
                <ChapterSelector
                    chapters={chapter.chapters}
                    value={chapter.number.toString()}
                    className="w-full"
                />
                <div className="flex flex-col gap-2 md:pt-2 md:border-t">
                    <div className="flex items-center gap-2">
                        <BookmarkButton
                            mangaId={chapter.mangaId}
                            className="w-full order-3 xl:order-2 p-2 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <ButtonLink
                            to={lastChapterExists ? `/manga/${chapter.mangaId}/${scanlator}/${chapter.lastChapter}` : "#"}
                            variant="outline"
                            className="flex-1"
                            aria-label="Previous Chapter"
                            disabled={!lastChapterExists}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </ButtonLink>
                        <ButtonLink
                            to={nextChapterExists ? `/manga/${chapter.mangaId}/${scanlator}/${chapter.nextChapter}` : "#"}
                            variant="outline"
                            className="flex-1"
                            aria-label="Next Chapter"
                            disabled={!nextChapterExists}
                        >
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function InfoPopover({
    chapter,
    scanlator,
    orientation,
}: {
    chapter: components["schemas"]["ChapterResponse"];
    scanlator: string;
    orientation: "vertical" | "horizontal";
}) {
    return (
        <PopoverDrawer>
            <PopoverDrawerTrigger>
                <Button variant="outline" size="icon" className="h-7.5 md:h-9">
                    <Info className="h-4 w-4" />
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent
                popoverSide={orientation === "vertical" ? "left" : "bottom"}
                popoverAlign="start"
                popoverClassName="w-auto sm:w-96 max-h-96 overflow-y-auto"
            >
                <InfoContent chapter={chapter} scanlator={scanlator} />
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
}
