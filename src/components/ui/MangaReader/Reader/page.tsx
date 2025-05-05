"use client";

import { Chapter } from "@/app/api/interfaces";
import { default as NextImage } from "next/image";
import PageProgress from "../pageProgress";
import MangaFooter from "../mangaFooter";
import EndOfManga from "../endOfManga";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { syncAllServices } from "@/lib/sync";
import db from "@/lib/db";

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
    const stripDetectionThreshold = 3; // Number of consecutive 1500px images to consider it a strip manga
    const hasToggledReaderModeRef = useRef(false);

    // Add effective page count as a derived state
    const [effectivePageCount, setEffectivePageCount] = useState(
        chapter?.images?.length || 0,
    );

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
        [updatePageUrl, resetInactivityTimer],
    );

    // Navigation methods
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

    // Load manga cache once on mount
    useEffect(() => {
        if (!chapter) return;

        async function checkCacheOnMount() {
            try {
                const mangaCache = await db.getCache(
                    db.hqMangaCache,
                    chapter.parentId,
                );

                // If we have cache data and it's marked as strip manga
                if (
                    mangaCache?.is_strip !== undefined &&
                    !hasToggledReaderModeRef.current
                ) {
                    hasToggledReaderModeRef.current = true;
                    toggleReaderMode();
                }
            } catch (error) {
                console.error("Error checking manga cache:", error);
            }
        }

        checkCacheOnMount();
    }, [chapter, toggleReaderMode]);

    // Helper function to load images for canvas directly from base64 data
    const loadImageFromBase64 = (
        base64Data: string,
    ): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = base64Data;
        });
    };

    // Process images using only the base64 data
    const processImages = useCallback(async () => {
        if (!chapter?.images?.length) return;

        try {
            const processed: string[] = Array(chapter.images.length).fill("");
            const skipped: number[] = [];
            let stripCheckCount = 0;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");

            // Create processing order - prioritize images around current page
            const processingOrder: number[] = [];

            // Start with currentPage, currentPage+1, currentPage-1
            processingOrder.push(currentPage);
            if (currentPage + 1 < chapter.images.length)
                processingOrder.push(currentPage + 1);
            if (currentPage - 1 >= 0) processingOrder.push(currentPage - 1);

            // Add remaining pages in order
            for (let i = 0; i < chapter.images.length; i++) {
                if (!processingOrder.includes(i)) {
                    processingOrder.push(i);
                }
            }

            // Process initial batch immediately to show something quickly
            const initialBatchSize = Math.min(3, chapter.images.length);
            for (let i = 0; i < initialBatchSize; i++) {
                const index = processingOrder[i];
                if (index === undefined) continue;

                // Skip already processed pages
                if (skipped.includes(index)) continue;

                const image = chapter.images[index];

                // Skip if no data available
                if (typeof image === "string") continue;
                if (!image.data) continue;

                // Check for strip manga detection
                if (image.height === 1500 && !hasToggledReaderModeRef.current) {
                    stripCheckCount++;
                    if (stripCheckCount >= stripDetectionThreshold) {
                        toggleReaderMode();
                        hasToggledReaderModeRef.current = true;

                        // Update the cache for future reference
                        db.updateCache(db.hqMangaCache, chapter.parentId, {
                            is_strip: true,
                        }).catch((error) => {
                            console.error("Error updating manga cache:", error);
                        });
                    }
                }

                // Check if this page can be combined with the next
                if (
                    image.height === 1500 &&
                    index < chapter.images.length - 1 &&
                    canvas &&
                    ctx
                ) {
                    const nextImage = chapter.images[index + 1];
                    if (typeof nextImage === "string") continue;
                    if (nextImage.data && nextImage.height) {
                        // We can directly combine the images since we know dimensions
                        canvas.width = image.width || 700;
                        canvas.height =
                            (image.height || 1500) + (nextImage.height || 1500);

                        try {
                            // Load images directly from base64 data
                            const img1 = await loadImageFromBase64(image.data);
                            const img2 = await loadImageFromBase64(
                                nextImage.data,
                            );

                            ctx.drawImage(img1, 0, 0);
                            ctx.drawImage(img2, 0, img1.height);

                            processed[index] = canvas.toDataURL("image/jpeg");
                            skipped.push(index + 1); // Mark the next page as skipped
                        } catch (error) {
                            console.error(
                                `Error combining images ${index} and ${index + 1}:`,
                                error,
                            );
                            // Fallback to using the single image data
                            processed[index] = image.data;
                        }
                    } else {
                        // Use the base64 data directly
                        processed[index] = image.data;
                    }
                } else {
                    // Use the base64 data directly
                    processed[index] = image.data;
                }
            }

            // Set initial pages batch
            setProcessedImages(processed);
            setSkipPages(skipped);
            setInitialPagesReady(true);

            // Process remaining images
            for (let i = initialBatchSize; i < processingOrder.length; i++) {
                const index = processingOrder[i];
                if (index === undefined) continue;

                // Skip already processed pages
                if (skipped.includes(index)) continue;

                const image = chapter.images[index];

                // Skip if no data available
                if (typeof image === "string") continue;
                if (!image.data) continue;

                // Check if this page can be combined with the next
                if (
                    image.height === 1500 &&
                    index < chapter.images.length - 1 &&
                    canvas &&
                    ctx
                ) {
                    const nextImage = chapter.images[index + 1];
                    if (typeof nextImage === "string") continue;
                    if (nextImage.data && nextImage.height) {
                        // We can directly combine the images since we know dimensions
                        canvas.width = image.width || 700;
                        canvas.height =
                            (image.height || 1500) + (nextImage.height || 1500);

                        try {
                            // Load images directly from base64 data
                            const img1 = await loadImageFromBase64(image.data);
                            const img2 = await loadImageFromBase64(
                                nextImage.data,
                            );

                            ctx.drawImage(img1, 0, 0);
                            ctx.drawImage(img2, 0, img1.height);

                            processed[index] = canvas.toDataURL("image/jpeg");

                            // Add to skip pages if not already there
                            if (!skipped.includes(index + 1)) {
                                skipped.push(index + 1);
                                setSkipPages((prev) => [...prev, index + 1]);
                            }
                        } catch (error) {
                            console.error(
                                `Error combining images ${index} and ${index + 1}:`,
                                error,
                            );
                            // Fallback to using the single image data
                            processed[index] = image.data;
                        }
                    } else {
                        // Use the base64 data directly
                        processed[index] = image.data;
                    }
                } else {
                    // Use the base64 data directly
                    processed[index] = image.data;
                }

                // Update processed images one by one to avoid re-renders
                setProcessedImages((prev) => {
                    const updated = [...prev];
                    updated[index] = processed[index];
                    return updated;
                });
            }

            // Final update of effective page count
            setEffectivePageCount(chapter.images.length - skipped.length);
        } catch (error) {
            console.error("Error in image processing:", error);
        } finally {
            setTimeout(() => {
                setIsProcessingImages(false);
            }, 300);
        }
    }, [chapter?.images, currentPage, toggleReaderMode]);

    useEffect(() => {
        processImages();
    }, [processImages]);

    // Simplified handle page load since we now have dimensions already
    const handlePageLoad = (
        e: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => {
        handleImageLoad(e, index);
    };

    const getEffectivePageIndex = useCallback(
        (index: number) => {
            if (!chapter) return 0;
            if (skipPages.includes(index)) return -1;

            // Simply count non-skipped pages up to this index
            let effectiveIndex = 0;
            for (let i = 0; i < index; i++) {
                if (!skipPages.includes(i)) {
                    effectiveIndex++;
                }
            }

            return effectiveIndex;
        },
        [chapter, skipPages],
    );

    const getActualPageIndex = useCallback(
        (effectiveIndex: number) => {
            if (!chapter) return 0;
            if (effectiveIndex < 0) return 0;

            // Count up through actual pages until we find the matching effective index
            let currentEffectiveIndex = 0;
            let actualIndex = 0;

            while (actualIndex < chapter.images.length) {
                if (!skipPages.includes(actualIndex)) {
                    if (currentEffectiveIndex === effectiveIndex) {
                        return actualIndex;
                    }
                    currentEffectiveIndex++;
                }
                actualIndex++;
            }

            // If we didn't find a match, return the last valid page
            return Math.max(0, chapter.images.length - 1);
        },
        [chapter, skipPages],
    );

    return (
        <>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div
                className={`flex flex-col justify-center items-center w-screen bg-transparent relative`}
                style={{
                    height: "calc(100dvh - var(--reader-offset))",
                }}
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
                <div
                    id="reader"
                    className={`relative max-h-full w-auto md:pr-12`}
                >
                    {initialPagesReady &&
                        [-1, 0, 1].map((offset) => {
                            const index = currentPage + offset;
                            if (index < 0 || index >= processedImages.length)
                                return null;

                            const effectiveIndex = getEffectivePageIndex(index);
                            if (effectiveIndex === -1) return null;

                            // Get dimensions from source image for proper sizing
                            const sourceImage = chapter.images[index];
                            const width =
                                typeof sourceImage === "object" &&
                                sourceImage.width
                                    ? sourceImage.width
                                    : 700;
                            const height =
                                typeof sourceImage === "object" &&
                                sourceImage.height
                                    ? sourceImage.height
                                    : 1080;

                            // Use processed image (combined) or fall back to direct base64 data
                            const imageSource =
                                processedImages[index] ||
                                (typeof sourceImage === "object"
                                    ? sourceImage.data
                                    : sourceImage) ||
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' fill='%23888'%3EImage data unavailable%3C/text%3E%3C/svg%3E";

                            return (
                                <NextImage
                                    key={index}
                                    src={imageSource}
                                    alt={`${chapter.title} - ${chapter.chapter} Page ${effectiveIndex + 1}`}
                                    width={width}
                                    height={height}
                                    loading="eager"
                                    className={`object-contain max-h-full w-full h-full cursor-pointer z-20 relative ${
                                        effectiveIndex !==
                                        getEffectivePageIndex(currentPage)
                                            ? "hidden"
                                            : ""
                                    }`}
                                    onLoad={(e) => handlePageLoad(e, offset)}
                                />
                            );
                        })}
                    <EndOfManga
                        title={chapter.title}
                        identifier={chapter.parentId}
                        className={`${getEffectivePageIndex(currentPage) !== effectivePageCount ? "hidden" : ""}`}
                    />
                </div>
                <div
                    className={`sm:opacity-0 lg:opacity-100 transition-opacity duration-300 ${isFooterVisible ? "opacity-100" : "opacity-0"} ${
                        getEffectivePageIndex(currentPage) !==
                        effectivePageCount
                            ? "block"
                            : "hidden md:block"
                    }`}
                    style={isProcessingImages ? { opacity: 0 } : undefined}
                >
                    <PageProgress
                        currentPage={Math.max(
                            0,
                            getEffectivePageIndex(currentPage),
                        )}
                        totalPages={effectivePageCount}
                        setCurrentPage={(page) => {
                            setPageWithUrlUpdate(getActualPageIndex(page));
                        }}
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
