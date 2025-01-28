"use client";

import { Chapter } from "@/app/api/interfaces";
import Image from "next/image";
import PageProgress from "../pageProgress";
import MangaFooter from "../mangaFooter";
import EndOfManga from "../endOfManga";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { syncAllServices } from "@/lib/sync";

interface PageReaderProps {
    chapter: Chapter;
    isFooterVisible: boolean;
    handleImageLoad: (
        e: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => void;
    toggleReaderMode: () => void;
}

export default function PageReader({
    chapter,
    isFooterVisible,
    handleImageLoad,
    toggleReaderMode,
}: PageReaderProps) {
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
    const router = useRouter();
    const hasPrefetchedRef = useRef(false);

    useEffect(() => {
        if (!chapter) return;

        // Handle bookmark update
        const isHalfwayThrough =
            currentPage >= Math.floor(chapter.images.length / 2);
        if (isHalfwayThrough && !bookmarkUpdatedRef.current) {
            syncAllServices(chapter);
            bookmarkUpdatedRef.current = true;
        }

        // Handle prefetching next chapter
        if (chapter.nextChapter && !hasPrefetchedRef.current) {
            const threshold = Math.min(
                Math.floor(chapter.images.length * 0.75),
                chapter.images.length - 3,
            );

            if (currentPage >= threshold) {
                router.prefetch(`/manga/${chapter.nextChapter}`);
                hasPrefetchedRef.current = true;
            }
        }
    }, [chapter, currentPage, router]);

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
        [updatePageUrl],
    );

    const nextPage = useCallback(() => {
        if (!chapter) return;
        if (isFooterVisible) return;

        const isLastPage = currentPage === chapter.images.length - 1;
        const nextChapterParts = chapter.nextChapter.split("/");

        if (isLastPage && nextChapterParts.length === 2) {
            router.push(`/manga/${chapter.nextChapter}`);
            return;
        }

        setPageWithUrlUpdate(currentPage + 1);
    }, [chapter, currentPage, router, isFooterVisible]);

    const prevPage = useCallback(() => {
        if (!chapter) return;
        if (isFooterVisible) return;

        if (currentPage > 0) {
            setPageWithUrlUpdate(currentPage - 1);
        } else if (currentPage === 0) {
            router.push(`/manga/${chapter.lastChapter}?page=last`);
        }
    }, [chapter, currentPage, router, isFooterVisible]);

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
        if (
            clickY < 100 ||
            clickY > window.innerHeight - 100 ||
            isFooterVisible
        )
            return;

        if (clickX > screenWidth / 2) {
            nextPage(); // Click on the right side
        } else {
            prevPage(); // Click on the left side
        }
    };

    return (
        <>
            <div
                className="flex flex-col justify-center items-center h-dvh w-screen bg-transparent"
                onClick={handleClick}
            >
                <div id="reader" className="relative max-h-dvh w-auto">
                    {chapter.images.map((image, index) => (
                        <Image
                            key={index}
                            src={`/api/image-proxy?imageUrl=${encodeURIComponent(image)}`}
                            alt={`${chapter.title} - ${chapter.chapter} Page ${index + 1}`}
                            width={700}
                            height={1080}
                            loading="eager"
                            priority={index === 1}
                            className={`object-contain max-h-dvh w-full h-full lg:h-dvh cursor-pointer z-20 relative ${index !== currentPage ? "hidden" : ""}`}
                            onLoad={(e) => handleImageLoad(e, index)}
                        />
                    ))}
                    <EndOfManga
                        title={chapter.title}
                        identifier={chapter.parentId}
                        className={`${chapter.images.length !== currentPage ? "hidden" : ""}`}
                    />
                </div>
                <div
                    className={`sm:opacity-0 lg:opacity-100 ${isFooterVisible ? "opacity-100" : "opacity-0"} ${chapter.images.length !== currentPage ? "block" : "hidden md:block"}`}
                >
                    <PageProgress
                        currentPage={currentPage}
                        totalPages={chapter.images.length}
                        setCurrentPage={setCurrentPage}
                        isFooterVisible={isFooterVisible}
                    />
                </div>
            </div>
            <div
                className={`footer ${isFooterVisible ? "footer-visible" : ""} ${currentPage === chapter.images.length ? "hidden" : ""}`}
            >
                <MangaFooter
                    chapterData={chapter}
                    toggleReaderMode={toggleReaderMode}
                />
            </div>
        </>
    );
}
