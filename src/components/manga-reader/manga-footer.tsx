import { ChevronLeft, ChevronRight } from "lucide-react";
import BookmarkButton from "../manga-details/bookmark-button";
import { Button } from "../ui/button";
import { ButtonLink } from "../ui/button-link";
import { ChapterSelector } from "./chapter-selector";

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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
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
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 w-full sm:w-90 xl:w-180">
                    {lastChapterExists ? (
                        <ButtonLink
                            href={`./${chapter.lastChapter}`}
                            variant="outline"
                            className="w-full order-0 xl:order-3"
                            aria-label="Previous Chapter"
                            prefetch={false}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </ButtonLink>
                    ) : (
                        <ButtonLink
                            href=""
                            disabled
                            variant="outline"
                            className="w-full order-0 xl:order-3"
                            aria-label="Previous Chapter"
                            tabIndex={-1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </ButtonLink>
                    )}
                    {nextChapterExists ? (
                        <ButtonLink
                            href={`./${chapter.nextChapter}`}
                            className="w-full order-1 xl:order-4"
                            aria-label="Next Chapter"
                            prefetch={false}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </ButtonLink>
                    ) : (
                        <ButtonLink
                            href=""
                            disabled
                            className="w-full order-1 xl:order-4"
                            aria-label="Next Chapter"
                            aria-disabled="true"
                            tabIndex={-1}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </ButtonLink>
                    )}
                    <Button
                        variant="outline"
                        className="w-full order-2 xl:order-1"
                        onClick={toggleReaderMode}
                    >
                        Toggle Reader
                    </Button>
                    <BookmarkButton
                        mangaId={chapter.mangaId}
                        className="w-full order-3 xl:order-2 p-2 h-9"
                    />
                </div>
            </div>
        </div>
    );
}
