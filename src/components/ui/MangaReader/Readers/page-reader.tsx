"use client";

import { Chapter, ChapterImage } from "@/app/api/interfaces";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageGroups } from "../reader";
import Image from "next/image";
import PageProgress from "../pageProgress";
import { syncAllServices } from "@/lib/sync";
import { useFooterVisibility } from "@/lib/footer-context";
import MangaFooter from "../mangaFooter";
import EndOfManga from "../endOfManga";

interface PageReaderProps {
    chapter: Chapter;
    images: ImageGroups;
    toggleReaderMode: (override?: boolean) => void;
}

export default function PageReader({
    chapter,
    images,
    toggleReaderMode,
}: PageReaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.get("page");
        if (!chapter) return 0;
        if (pageParam === "last") return images.length - 1;
        const pageNumber = parseInt(pageParam || "1", 10);
        return isNaN(pageNumber) || pageNumber < 1 || pageNumber > images.length
            ? 0
            : pageNumber - 1;
    });
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);
    const { isFooterVisible } = useFooterVisibility();

    useEffect(() => {
        if (!chapter) return;

        // Handle bookmark update
        const isHalfwayThrough = currentPage >= Math.floor(images.length / 2);
        if (isHalfwayThrough && !bookmarkUpdatedRef.current) {
            syncAllServices(chapter);
            bookmarkUpdatedRef.current = true;
        }

        // Handle prefetching next chapter
        if (chapter.nextChapter && !hasPrefetchedRef.current) {
            const threshold = Math.min(
                Math.floor(images.length * 0.75),
                images.length - 3,
            );

            if (currentPage >= threshold) {
                router.prefetch(`/manga/${chapter.nextChapter}`);
                hasPrefetchedRef.current = true;
            }
        }
    }, [chapter, currentPage, router, images.length]);

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
        if (
            currentPage === images.length - 1 &&
            chapter.nextChapter.split("/").length > 1
        ) {
            router.push(`/manga/${chapter.nextChapter}`);
            return;
        }

        if (currentPage < images.length) {
            setPageWithUrlUpdate(currentPage + 1);
        }
    }, [
        currentPage,
        images.length,
        setPageWithUrlUpdate,
        chapter.nextChapter,
        router,
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

        if (
            clickY < 100 ||
            clickY > window.innerHeight - 100 ||
            isFooterVisible
        )
            return;

        if (clickX > middleZoneEnd) {
            nextPage();
        } else if (clickX < middleZoneStart) {
            prevPage();
        }
    };

    const currentImages: ChapterImage[] = images[currentPage] || [];
    const nextImages: ChapterImage[] = images[currentPage + 1] || [];

    return (
        <>
            <div
                className="w-full h-full flex flex-col relative"
                style={{ height: "calc(100dvh - var(--reader-offset))" }}
                onClick={handleClick}
            >
                <div
                    className="my-auto"
                    style={{ maxHeight: "calc(100dvh - var(--reader-offset))" }}
                >
                    {currentImages.map((img, idx) => {
                        // Calculate relative height based on actual image dimensions
                        const totalHeight = currentImages.reduce(
                            (sum, image) => sum + (image.height || 1000),
                            0,
                        );
                        const relativeHeight = img.height
                            ? `${(img.height / totalHeight) * 100}%`
                            : `${100 / currentImages.length}%`;

                        return (
                            <Image
                                key={idx}
                                src={img.url}
                                alt={`Page ${currentPage + 1}, panel ${idx + 1}`}
                                className="w-full h-auto object-contain"
                                loading="eager"
                                width={img.width || 800}
                                height={img.height || 1200}
                                style={{ maxHeight: relativeHeight }}
                            />
                        );
                    })}
                    <EndOfManga
                        title={chapter.title}
                        identifier={chapter.parentId}
                        className={`${currentPage !== images.length ? "hidden" : ""}`}
                    />
                </div>
                <div className={"hidden"}>
                    {nextImages.map((img, idx) => (
                        <Image
                            key={idx}
                            src={img.url}
                            alt={`Next page preview`}
                            className="w-full h-auto object-contain"
                            loading="eager"
                            width={img.width || 800}
                            height={img.height || 1200}
                        />
                    ))}
                </div>
            </div>
            <div
                className={`sm:opacity-0 lg:opacity-100 transition-opacity duration-300 ${isFooterVisible ? "opacity-100" : "opacity-0"} ${
                    currentPage !== images.length - 1
                        ? "block"
                        : "hidden md:block"
                }`}
            >
                <PageProgress
                    currentPage={Math.max(
                        0,
                        Math.min(currentPage, images.length - 1),
                    )}
                    totalPages={images.length}
                    setCurrentPage={(page) => {
                        setPageWithUrlUpdate(page);
                    }}
                    isFooterVisible={isFooterVisible}
                />
            </div>
            <div
                className={`footer ${isFooterVisible ? "footer-visible" : ""} ${currentPage === images.length ? "hidden" : ""}`}
            >
                <MangaFooter
                    chapterData={chapter}
                    toggleReaderMode={toggleReaderMode}
                />
            </div>
        </>
    );
}
