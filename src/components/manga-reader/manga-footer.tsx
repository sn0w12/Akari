import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { ChapterSelector } from "./chapter-selector";
import { FooterBookmarkButton } from "./footer-bookmark";
import { cn } from "@/lib/utils";
import { ButtonLink } from "../ui/button-link";

export default function MangaFooter({
    chapter,
    toggleReaderMode,
}: {
    chapter: components["schemas"]["ChapterResponse"];
    toggleReaderMode: () => void;
}) {
    const lastChapterExists = chapter.lastChapter !== null;
    const nextChapterExists = chapter.nextChapter !== null;

    return (
        <div className="bg-background border-t border-b border-border px-4 py-3">
            <div
                className={cn(
                    "container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2"
                )}
            >
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left md:ml-10">
                    <h2 className="text-lg font-semibold">
                        <a
                            href={`/manga/${chapter.mangaId}`}
                            className="hover:underline"
                        >
                            {chapter.mangaTitle}
                        </a>
                    </h2>
                    <ChapterSelector
                        chapters={chapter.chapters}
                        value={chapter.number.toString()}
                    />
                </div>
                <div className="flex flex-col w-full sm:w-72 md:w-auto md:flex-row gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={toggleReaderMode}
                        >
                            Toggle Reader
                        </Button>
                        <FooterBookmarkButton chapter={chapter} />
                    </div>
                    <div className="flex items-center gap-4">
                        {lastChapterExists ? (
                            <ButtonLink
                                href={`./${chapter.lastChapter}`}
                                variant="outline"
                                className="flex-1"
                                aria-label="Previous Chapter"
                                prefetch={false}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </ButtonLink>
                        ) : (
                            <ButtonLink
                                href=""
                                disabled
                                variant="outline"
                                className="flex-1"
                                aria-label="Previous Chapter"
                                tabIndex={-1}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </ButtonLink>
                        )}
                        {nextChapterExists ? (
                            <ButtonLink
                                href={`./${chapter.nextChapter}`}
                                className="flex-1"
                                aria-label="Next Chapter"
                                prefetch={false}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </ButtonLink>
                        ) : (
                            <ButtonLink
                                href=""
                                disabled
                                className="flex-1"
                                aria-label="Next Chapter"
                                aria-disabled="true"
                                tabIndex={-1}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
