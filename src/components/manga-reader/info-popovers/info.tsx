import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

import { BookmarkButton } from "@/components/manga-details/bookmark-button";
import { Button } from "../../ui/button";
import { ButtonLink } from "../../ui/button-link";
import {
    ResponsiveModal,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTrigger,
} from "../../ui/responsive-modal";
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
                <h2 className="text-lg font-semibold leading-tight text-center md:text-left">
                    <Link
                        to="/manga/$mangaId"
                        params={{ mangaId: chapter.mangaId }}
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
                            size="default"
                            className="w-full order-3 xl:order-2"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <ButtonLink
                            to={
                                lastChapterExists
                                    ? `/manga/${chapter.mangaId}/${scanlator}/${chapter.lastChapter}`
                                    : "#"
                            }
                            variant="outline"
                            className="flex-1"
                            aria-label="Previous Chapter"
                            disabled={!lastChapterExists}
                        >
                            <ChevronLeft className="mr-2 size-4" />
                            Previous
                        </ButtonLink>
                        <ButtonLink
                            to={
                                nextChapterExists
                                    ? `/manga/${chapter.mangaId}/${scanlator}/${chapter.nextChapter}`
                                    : "#"
                            }
                            variant="outline"
                            className="flex-1"
                            aria-label="Next Chapter"
                            disabled={!nextChapterExists}
                        >
                            Next
                            <ChevronRight className="ml-2 size-4" />
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
}: {
    chapter: components["schemas"]["ChapterResponse"];
    scanlator: string;
}) {
    return (
        <ResponsiveModal desktop="popover">
            <ResponsiveModalTrigger
                render={
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-7.5 md:size-9"
                    >
                        <Info />
                    </Button>
                }
            />
            <ResponsiveModalPopup
                dialogClassName="w-auto sm:w-96"
                align="end"
                side="right"
            >
                <ResponsiveModalPanel>
                    <InfoContent chapter={chapter} scanlator={scanlator} />
                </ResponsiveModalPanel>
            </ResponsiveModalPopup>
        </ResponsiveModal>
    );
}
