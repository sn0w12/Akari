"use client";

import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "../../ui/button";
import { ButtonLink } from "../../ui/button-link";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { ChapterSelector } from "../chapter-selector";
import { FooterBookmarkButton } from "../footer-bookmark";

export function InfoContent({
    chapter,
}: {
    chapter: components["schemas"]["ChapterResponse"];
}) {
    const lastChapterExists = chapter.lastChapter !== null;
    const nextChapterExists = chapter.nextChapter !== null;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-lg font-bold leading-tight">
                    <Link
                        href={`/manga/${chapter.mangaId}`}
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        {chapter.mangaTitle}
                    </Link>
                </h2>
                <div className="hidden md:block">
                    <label className="text-sm font-medium text-muted-foreground">
                        Chapter
                    </label>
                    <ChapterSelector
                        chapters={chapter.chapters}
                        value={chapter.number.toString()}
                        className="w-full"
                    />
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <FooterBookmarkButton chapter={chapter} />
                    </div>
                    <div className="flex items-center gap-2">
                        <ButtonLink
                            href={`./${chapter.lastChapter}`}
                            variant="outline"
                            className="flex-1"
                            aria-label="Previous Chapter"
                            prefetch={false}
                            disabled={!lastChapterExists}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </ButtonLink>
                        <ButtonLink
                            href={`./${chapter.nextChapter}`}
                            variant="outline"
                            className="flex-1"
                            aria-label="Next Chapter"
                            prefetch={false}
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
    orientation,
}: {
    chapter: components["schemas"]["ChapterResponse"];
    orientation: "vertical" | "horizontal";
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-7.5 md:h-9">
                    <Info className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side={orientation === "vertical" ? "left" : "bottom"}
                align="end"
                className="w-auto sm:w-96 max-h-96 overflow-y-auto"
            >
                <InfoContent chapter={chapter} />
            </PopoverContent>
        </Popover>
    );
}
