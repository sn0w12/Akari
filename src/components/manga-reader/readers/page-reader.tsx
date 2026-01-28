"use client";

import { useShortcut } from "@/hooks/use-shortcut";
import { useWindowWidth } from "@/hooks/use-window-width";
import { syncAllServices } from "@/lib/manga/sync";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChapterInfo } from "../chapter-info";
import EndOfManga from "../end-of-manga";
import MangaFooter from "../manga-footer";
import PageProgress from "../page-progress";

interface PageReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    scrollMetrics: { pixels: number; percentage: number };
    toggleReaderMode: () => void;
    isInactive: boolean;
    setBookmarkState: (state: boolean | null) => void;
}

const pageHeightStyle = "calc(100dvh - var(--reader-offset))";
export default function PageReader({
    chapter,
    scrollMetrics,
    toggleReaderMode,
    isInactive,
    setBookmarkState,
}: PageReaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const readingDir = useSetting("readingDirection");
    const continueAfterChapter = useSetting("continueAfterChapter");
    const windowWidth = useWindowWidth();
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.get("page");
        if (!chapter) return 0;
        if (pageParam === "last") return chapter.images.length - 1;
        const pageNumber = parseInt(pageParam || "1", 10);
        return isNaN(pageNumber) ||
            pageNumber < 1 ||
            pageNumber > chapter.images.length
            ? 0
            : pageNumber - 1;
    });
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);

    useEffect(() => {
        if (!chapter) return;

        // Handle bookmark update
        const isHalfwayThrough =
            currentPage >= Math.floor(chapter.images.length / 2);
        if (isHalfwayThrough && !bookmarkUpdatedRef.current) {
            bookmarkUpdatedRef.current = true;
            syncAllServices(chapter).then((success) => {
                setBookmarkState(success);
            });
        }

        // Handle prefetching next chapter
        if (chapter.nextChapter && !hasPrefetchedRef.current) {
            const threshold = Math.min(
                Math.floor(chapter.images.length * 0.75),
                chapter.images.length - 3,
            );

            if (currentPage >= threshold) {
                router.prefetch(`./${chapter.nextChapter}`);
                hasPrefetchedRef.current = true;
            }
        }
    }, [chapter, currentPage, router, setBookmarkState]);

    const setPageWithUrlUpdate = useCallback((newPage: number) => {
        setCurrentPage(newPage);

        if (typeof window === "undefined") return;
        // Use history.replaceState to update URL without triggering Next.js re-renders
        window.history.replaceState(null, "", `?page=${newPage + 1}`);
    }, []);

    const nextPage = useCallback(() => {
        if (
            currentPage === chapter.images.length - 1 &&
            chapter.nextChapter &&
            continueAfterChapter
        ) {
            router.push(`./${chapter.nextChapter}`);
            return;
        }

        if (currentPage < chapter.images.length) {
            setPageWithUrlUpdate(currentPage + 1);
        }
    }, [
        currentPage,
        chapter.images.length,
        chapter.nextChapter,
        router,
        continueAfterChapter,
        setPageWithUrlUpdate,
    ]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setPageWithUrlUpdate(currentPage - 1);
        }
    }, [currentPage, setPageWithUrlUpdate]);

    useShortcut(readingDir === "rtl" ? "ARROWLEFT" : "ARROWRIGHT", nextPage);
    useShortcut(readingDir === "rtl" ? "ARROWRIGHT" : "ARROWLEFT", prevPage);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const screenWidth = windowWidth;
            const clickX = e.clientX;
            const middleZoneStart = screenWidth * 0.4;
            const middleZoneEnd = screenWidth * 0.6;

            if (readingDir === "rtl") {
                if (clickX > middleZoneEnd) {
                    prevPage();
                } else if (clickX < middleZoneStart) {
                    nextPage();
                }
            } else {
                if (clickX > middleZoneEnd) {
                    nextPage();
                } else if (clickX < middleZoneStart) {
                    prevPage();
                }
            }
        },
        [nextPage, prevPage, readingDir, windowWidth],
    );

    return (
        <>
            <ChapterInfo
                chapter={chapter}
                hidden={scrollMetrics.pixels >= 50}
            />
            <div
                className="w-full h-full flex flex-col relative"
                style={{ height: pageHeightStyle }}
            >
                <div className="flex flex-col h-full">
                    {/* Spacer for 1/3 of available space at the top */}
                    <div className="flex-1"></div>
                    {/* Content container: image or end-of-manga, no shrinking/growing */}
                    <div className="flex-shrink-0">
                        {chapter.images[currentPage] && (
                            <Image
                                src={chapter.images[currentPage]}
                                alt={`Page ${currentPage + 1}`}
                                className={cn("w-full h-auto object-contain", {
                                    "cursor-none":
                                        isInactive &&
                                        currentPage !== chapter.images.length,
                                    "cursor-pointer":
                                        !isInactive &&
                                        currentPage !== chapter.images.length,
                                })}
                                style={{
                                    maxHeight: pageHeightStyle,
                                }}
                                loading="eager"
                                width={720}
                                height={1500}
                                unoptimized={true}
                                preload={true}
                                fetchPriority="high"
                                onClick={handleClick}
                            />
                        )}
                        <EndOfManga
                            title={chapter.title}
                            identifier={chapter.mangaId}
                            className={`${
                                currentPage !== chapter.images.length
                                    ? "hidden"
                                    : ""
                            }`}
                        />
                    </div>
                    {/* Spacer for 2/3 of available space at the bottom */}
                    <div style={{ flex: 2 }}></div>
                </div>
                <div className={"hidden"}>
                    {typeof chapter.images[currentPage + 1] === "string" && (
                        <Image
                            src={chapter.images[currentPage + 1] as string}
                            alt={`Page ${currentPage + 2}`}
                            className="w-full h-auto max-h-screen object-contain"
                            style={{
                                maxHeight: pageHeightStyle,
                            }}
                            loading="eager"
                            width={720}
                            height={1500}
                            unoptimized={true}
                        />
                    )}
                </div>
            </div>
            <div
                className={`sm:opacity-0 lg:opacity-100 transition-opacity duration-300 ${
                    currentPage !== chapter.images.length
                        ? "block"
                        : "hidden md:block"
                }`}
            >
                <PageProgress
                    currentPage={Math.max(
                        0,
                        Math.min(currentPage, chapter.images.length - 1),
                    )}
                    totalPages={chapter.images.length}
                    setCurrentPage={(page) => {
                        setPageWithUrlUpdate(page);
                    }}
                    hidden={scrollMetrics.pixels >= 50}
                />
            </div>
            <MangaFooter
                chapter={chapter}
                toggleReaderMode={toggleReaderMode}
            />
        </>
    );
}
