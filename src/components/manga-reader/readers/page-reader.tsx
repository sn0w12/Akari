"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import PageProgress from "../page-progress";
import { syncAllServices } from "@/lib/manga/sync";
import { useQueryClient } from "@tanstack/react-query";
import EndOfManga from "../end-of-manga";
import MangaFooter from "../manga-footer";

interface PageReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    scrollMetrics: { pixels: number; percentage: number };
    toggleReaderMode: () => void;
    isInactive: boolean;
    bgColor: string;
    setBookmarkState: (state: boolean | null) => void;
}

export default function PageReader({
    chapter,
    scrollMetrics,
    toggleReaderMode,
    isInactive,
    bgColor,
    setBookmarkState,
}: PageReaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
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
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!chapter) return;

        // Handle bookmark update
        const isHalfwayThrough =
            currentPage >= Math.floor(chapter.images.length / 2);
        if (isHalfwayThrough && !bookmarkUpdatedRef.current) {
            bookmarkUpdatedRef.current = true;
            syncAllServices(chapter).then((success) => {
                setBookmarkState(success);
                if (success) {
                    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
                }
            });
        }

        // Handle prefetching next chapter
        if (chapter.nextChapter && !hasPrefetchedRef.current) {
            const threshold = Math.min(
                Math.floor(chapter.images.length * 0.75),
                chapter.images.length - 3
            );

            if (currentPage >= threshold) {
                router.prefetch(`./${chapter.nextChapter}`);
                hasPrefetchedRef.current = true;
            }
        }
    }, [chapter, currentPage, router, setBookmarkState, queryClient]);

    const updatePageUrl = useCallback((pageNum: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", (pageNum + 1).toString());
        window.history.replaceState({}, "", url.toString());
    }, []);

    const setPageWithUrlUpdate = useCallback(
        (newPage: number) => {
            setCurrentPage(newPage);
            updatePageUrl(newPage);
        },
        [updatePageUrl]
    );

    const nextPage = useCallback(() => {
        if (currentPage === chapter.images.length - 1 && chapter.nextChapter) {
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
        setPageWithUrlUpdate,
    ]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setPageWithUrlUpdate(currentPage - 1);
        }
    }, [currentPage, setPageWithUrlUpdate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                nextPage();
            } else if (e.key === "ArrowLeft") {
                prevPage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextPage, prevPage]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const screenWidth = window.innerWidth;
        const clickX = e.clientX;
        const clickY = e.clientY;
        const middleZoneStart = screenWidth * 0.4;
        const middleZoneEnd = screenWidth * 0.6;

        if (clickY < 100 || clickY > window.innerHeight - 100) return;

        if (clickX > middleZoneEnd) {
            nextPage();
        } else if (clickX < middleZoneStart) {
            prevPage();
        }
    };

    return (
        <>
            <div
                className={`w-full h-full flex flex-col relative transition-colors duration-500 ${bgColor} ${
                    currentPage === chapter.images.length
                        ? ""
                        : isInactive
                        ? "cursor-none"
                        : "cursor-pointer"
                }`}
                style={{ height: "calc(100dvh - var(--reader-offset))" }}
                onClick={handleClick}
            >
                <div className="my-auto">
                    {chapter.images[currentPage] && (
                        <Image
                            src={chapter.images[currentPage]}
                            alt={`Page ${currentPage + 1}`}
                            className="w-full h-auto object-contain"
                            style={{
                                maxHeight:
                                    "calc(100dvh - var(--reader-offset))",
                            }}
                            loading="eager"
                            width={720}
                            height={1500}
                            unoptimized={true}
                            priority={true}
                            preload={true}
                            fetchPriority="high"
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
                <div className={"hidden"}>
                    {typeof chapter.images[currentPage + 1] === "string" && (
                        <Image
                            src={chapter.images[currentPage + 1] as string}
                            alt={`Page ${currentPage + 2}`}
                            className="w-full h-auto max-h-screen object-contain"
                            style={{
                                maxHeight:
                                    "calc(100dvh - var(--reader-offset))",
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
                        Math.min(currentPage, chapter.images.length - 1)
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
