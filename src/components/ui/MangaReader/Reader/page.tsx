"use client";

import { Chapter } from "@/app/api/interfaces";
import { default as NextImage } from "next/image";
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
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);
    const router = useRouter();
    const [skipPages, setSkipPages] = useState<number[]>([]);
    const [isProcessingImages, setIsProcessingImages] = useState(true);
    const [processedImages, setProcessedImages] = useState<string[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [initialPagesReady, setInitialPagesReady] = useState(false);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        setIsInactive(false);
        inactivityTimer.current = setTimeout(() => {
            setIsInactive(true);
        }, 60000);
    }, []);

    useEffect(() => {
        // Initialize the inactivity timer
        resetInactivityTimer();

        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
        ];
        events.forEach((event) => {
            window.addEventListener(event, resetInactivityTimer);
        });

        return () => {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetInactivityTimer);
            });
        };
    }, [resetInactivityTimer]);

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
            resetInactivityTimer();
        },
        [updatePageUrl],
    );

    const nextPage = useCallback(() => {
        if (!chapter) return;
        if (isFooterVisible) return;

        const nextPageIndex = currentPage + 1;
        // Skip the next page if it's part of a combined image
        const skipToPage = skipPages.includes(nextPageIndex)
            ? nextPageIndex + 1
            : nextPageIndex;

        const isLastPage = skipToPage >= chapter.images.length;
        const nextChapterParts = chapter.nextChapter.split("/");

        if (isLastPage && nextChapterParts.length === 2) {
            router.push(`/manga/${chapter.nextChapter}`);
            return;
        }

        if (skipToPage <= chapter.images.length) {
            setPageWithUrlUpdate(skipToPage);
        }
    }, [
        chapter,
        currentPage,
        skipPages,
        router,
        isFooterVisible,
        setPageWithUrlUpdate,
    ]);

    const prevPage = useCallback(() => {
        if (!chapter) return;
        if (isFooterVisible) return;

        let prevPageIndex = currentPage - 1;
        // Skip the previous page if it's part of a combined image
        while (prevPageIndex >= 0 && skipPages.includes(prevPageIndex)) {
            prevPageIndex--;
        }

        if (prevPageIndex >= 0) {
            setPageWithUrlUpdate(prevPageIndex);
        } else if (prevPageIndex < 0) {
            router.push(`/manga/${chapter.lastChapter}?page=last`);
        }
    }, [
        chapter,
        currentPage,
        skipPages,
        router,
        isFooterVisible,
        setPageWithUrlUpdate,
    ]);

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

    const processImages = useCallback(async () => {
        if (!chapter?.images?.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = `/api/image-proxy?imageUrl=${encodeURIComponent(url)}`;
            });
        };

        try {
            const processed: string[] = [];
            const skipped: number[] = [];

            // First, process the initial 3 pages
            const initialBatch = chapter.images.slice(0, 3);
            const initialImages = await Promise.all(
                initialBatch.map((url) => loadImage(url)),
            );

            // Process initial images
            for (let i = 0; i < initialImages.length; i++) {
                if (skipped.includes(i)) continue;

                const img = initialImages[i];
                if (img.height === 1500 && i < initialImages.length - 1) {
                    const nextImg = initialImages[i + 1];
                    canvas.width = img.width;
                    canvas.height = img.height + nextImg.height;
                    ctx.drawImage(img, 0, 0);
                    ctx.drawImage(nextImg, 0, img.height);
                    processed[i] = canvas.toDataURL("image/jpeg");
                    skipped.push(i + 1);
                } else {
                    processed[i] =
                        `/api/image-proxy?imageUrl=${encodeURIComponent(chapter.images[i])}`;
                }
            }

            // Make initial pages available
            setProcessedImages(processed);
            setSkipPages(skipped);
            setInitialPagesReady(true);

            // Process remaining images
            const remainingImages = await Promise.all(
                chapter.images.slice(3).map((url) => loadImage(url)),
            );

            // Process remaining images
            for (let i = 3; i < chapter.images.length; i++) {
                if (skipped.includes(i)) continue;

                const img = remainingImages[i - 3];
                if (img.height === 1500 && i < chapter.images.length - 1) {
                    const nextImg = remainingImages[i - 2];
                    canvas.width = img.width;
                    canvas.height = img.height + nextImg.height;
                    ctx.drawImage(img, 0, 0);
                    ctx.drawImage(nextImg, 0, img.height);
                    processed[i] = canvas.toDataURL("image/jpeg");
                    skipped.push(i + 1);
                } else {
                    processed[i] =
                        `/api/image-proxy?imageUrl=${encodeURIComponent(chapter.images[i])}`;
                }
            }

            // Update with all processed images
            setProcessedImages(processed);
            setSkipPages(skipped);
        } catch (error) {
            console.error("Error processing images:", error);
        } finally {
            setIsProcessingImages(false);
        }
    }, [chapter?.images]);

    useEffect(() => {
        processImages();
    }, [processImages]);

    const handlePageLoad = (
        e: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => {
        handleImageLoad(e, index);
    };

    const getEffectivePageCount = useCallback(() => {
        return chapter.images.length - skipPages.length;
    }, [chapter.images.length, skipPages.length]);

    const getEffectivePageIndex = useCallback(
        (index: number) => {
            if (skipPages.includes(index)) return -1; // Return -1 for skipped pages
            return index - skipPages.filter((skip) => skip < index).length;
        },
        [skipPages],
    );

    return (
        <>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div
                className={`flex flex-col justify-center items-center h-dvh w-screen bg-transparent relative`}
                onClick={handleClick}
            >
                <div
                    className={`absolute inset-0 z-30 flex pointer-events-none transition-all ${isInactive && currentPage !== chapter.images.length ? "opacity-100" : "opacity-0"}`}
                >
                    <div className="w-2/5 h-full flex items-center justify-center">
                        <div className="bg-black/30 border-2 border-black/50 rounded-lg w-full h-[calc(100vh-200px)] flex items-center justify-center">
                            <span className="text-white/90 text-xl font-medium">
                                ← Previous Page
                            </span>
                        </div>
                    </div>
                    <div className="w-1/5 h-full flex items-center justify-center">
                        <div className="hidden"></div>
                    </div>
                    <div className="w-2/5 h-full flex items-center justify-center">
                        <div className="bg-black/30 border-2 border-black/50 rounded-lg w-full h-[calc(100vh-200px)] flex items-center justify-center">
                            <span className="text-white/90 text-xl font-medium">
                                Next Page →
                            </span>
                        </div>
                    </div>
                </div>
                <div id="reader" className="relative max-h-dvh w-auto">
                    {initialPagesReady &&
                        [-1, 0, 1].map((offset) => {
                            const index = currentPage + offset;
                            if (index < 0 || index >= processedImages.length)
                                return null;

                            const effectiveIndex = getEffectivePageIndex(index);
                            if (effectiveIndex === -1) return null;

                            return (
                                <NextImage
                                    key={index}
                                    src={processedImages[index]}
                                    alt={`${chapter.title} - ${chapter.chapter} Page ${effectiveIndex + 1}`}
                                    width={700}
                                    height={1080}
                                    loading="eager"
                                    priority={index === currentPage}
                                    className={`object-contain max-h-dvh w-full h-full lg:h-dvh cursor-pointer z-20 relative ${
                                        effectiveIndex !==
                                        getEffectivePageIndex(currentPage)
                                            ? "hidden"
                                            : ""
                                    }`}
                                    onLoad={(e) => handlePageLoad(e, index)}
                                />
                            );
                        })}
                    <EndOfManga
                        title={chapter.title}
                        identifier={chapter.parentId}
                        className={`${getEffectivePageIndex(currentPage) !== getEffectivePageCount() ? "hidden" : ""}`}
                    />
                </div>
                {!isProcessingImages && (
                    <div
                        className={`sm:opacity-0 lg:opacity-100 transition-opacity duration-300 ${
                            isFooterVisible ? "opacity-100" : "opacity-0"
                        } ${
                            getEffectivePageIndex(currentPage) !==
                            getEffectivePageCount()
                                ? "block"
                                : "hidden md:block"
                        }`}
                    >
                        <PageProgress
                            currentPage={getEffectivePageIndex(currentPage)}
                            totalPages={getEffectivePageCount()}
                            setCurrentPage={(page) => {
                                const adjustedPage =
                                    page +
                                    skipPages.filter((skip) => skip <= page)
                                        .length;
                                setCurrentPage(adjustedPage);
                            }}
                            isFooterVisible={isFooterVisible}
                        />
                    </div>
                )}
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
