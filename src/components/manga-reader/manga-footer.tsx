import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Chapter } from "@/types/manga";
import { Button } from "../ui/button";
import { ChapterSelector } from "./chapter-selector";
import { FooterBookmarkButton } from "./footer-bookmark";
import { useFooterVisibility } from "@/contexts/footer-context";
import { cn } from "@/lib/utils";

export default function MangaFooter({
    chapterData,
    toggleReaderMode,
}: {
    chapterData: Chapter;
    toggleReaderMode: () => void;
}) {
    const { isTouchInteractionEnabled } = useFooterVisibility();
    const lastChapterExists = chapterData.lastChapter.split("/").length === 2;
    const nextChapterExists = chapterData.nextChapter.split("/").length === 2;
    const transformedChapters = chapterData.chapters.map((chapter) => ({
        value: chapter.value,
        label:
            chapter.label.match(/[Cc]hapter\s+\d+(\.\d+)?/)?.[0] ??
            chapter.label,
    }));

    return (
        <div className="bg-background border-t border-border px-4 py-3">
            <div
                className={cn(
                    "container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2",
                    !isTouchInteractionEnabled &&
                        "pointer-events-none md:pointer-events-auto"
                )}
            >
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left md:ml-10">
                    <h2 className="text-lg font-semibold">
                        <a
                            href={`/manga/${chapterData.parentId}`}
                            className="hover:underline"
                        >
                            {chapterData.title}
                        </a>
                    </h2>
                    <ChapterSelector
                        chapters={transformedChapters}
                        value={
                            chapterData.chapter
                                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0]
                                .match(/(\d+)(\.\d+)?/)?.[0] ?? "1"
                        }
                    />
                </div>
                <div className="flex flex-col w-full sm:w-64 md:w-auto md:flex-row gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            className="inline-flex flex-grow items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background  hover:bg-accent text-accent-foreground h-9 w-28 px-4 py-2"
                            onClick={toggleReaderMode}
                        >
                            Toggle Reader
                        </Button>
                        <FooterBookmarkButton chapterData={chapterData} />
                    </div>
                    <div className="flex items-center gap-4">
                        {lastChapterExists ? (
                            <Link
                                href={`/manga/${chapterData.lastChapter}`}
                                className="flex-grow inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background  hover:bg-accent hover:text-accent-foreground h-9 w-28 px-4 py-2"
                                aria-label="Previous Chapter"
                                prefetch={false}
                                data-no-prefetch
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Link>
                        ) : (
                            <span
                                className="flex-grow inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background  h-9 w-28 px-4 py-2 opacity-50 cursor-not-allowed"
                                aria-label="Previous Chapter"
                                aria-disabled="true"
                                tabIndex={-1}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </span>
                        )}
                        {nextChapterExists ? (
                            <Link
                                href={`/manga/${chapterData.nextChapter}`}
                                className="flex-grow inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-28 px-4 py-2"
                                aria-label="Next Chapter"
                                prefetch={false}
                                data-no-prefetch
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        ) : (
                            <span
                                className="flex-grow inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow h-9 w-28 px-4 py-2 opacity-50 cursor-not-allowed"
                                aria-label="Next Chapter"
                                aria-disabled="true"
                                tabIndex={-1}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
