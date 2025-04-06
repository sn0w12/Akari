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
    isSidebarCollapsed: boolean;
}

export default function PageReader({
    chapter,
    isFooterVisible,
    handleImageLoad,
    toggleReaderMode,
    isSidebarCollapsed,
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
    const [checkedForStripManga, setCheckedForStripManga] = useState(false);
    const stripCheckCountRef = useRef(0);
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
                }

                // Mark as checked regardless of result
                setCheckedForStripManga(true);
            } catch (error) {
                console.error("Error checking manga cache:", error);
                setCheckedForStripManga(true); // Mark as checked even on error
            }
        }

        checkCacheOnMount();
    }, [chapter, toggleReaderMode]);

    // Simplified track image heights for strip manga detection
    const handleImageHeight = useCallback(
        (height: number) => {
            // Only track if we haven't toggled yet
            if (hasToggledReaderModeRef.current) return;

            if (height === 1500) {
                stripCheckCountRef.current++;

                // Check if we've seen enough 1500px images
                if (stripCheckCountRef.current >= stripDetectionThreshold) {
                    // Toggle reader mode if we haven't already
                    if (!hasToggledReaderModeRef.current) {
                        requestAnimationFrame(() => {
                            toggleReaderMode();
                            hasToggledReaderModeRef.current = true;

                            // Update the cache for future reference
                            if (chapter) {
                                db.updateCache(
                                    db.hqMangaCache,
                                    chapter.parentId,
                                    {
                                        is_strip: true,
                                    },
                                ).catch((error) => {
                                    console.error(
                                        "Error updating manga cache:",
                                        error,
                                    );
                                });
                            }
                        });
                    }
                }
            } else {
                // Reset counter if we encounter a non-1500px image
                stripCheckCountRef.current = 0;
            }
        },
        [chapter, toggleReaderMode],
    );

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
                img.onload = () => {
                    // Check for strip manga detection during image processing
                    if (!hasToggledReaderModeRef.current) {
                        handleImageHeight(img.height);
                    }
                    resolve(img);
                };
                img.onerror = reject;
                img.src = `/api/image-proxy?imageUrl=${encodeURIComponent(url)}`;
            });
        };

        try {
            const processed: string[] = Array(chapter.images.length);
            const skipped: number[] = [];
            let imagesLoaded = 0;
            const initialBatchSize = Math.min(4, chapter.images.length);

            // Create processing order - prioritize images around current page
            const processingOrder: number[] = [];

            // Start with currentPage - 1, currentPage, currentPage + 1
            const startIndex = Math.max(0, currentPage - 1);
            for (let i = 0; i < 3; i++) {
                const index = startIndex + i;
                if (index < chapter.images.length) {
                    processingOrder.push(index);
                }
            }

            // Add remaining pages in order
            for (let i = 0; i < chapter.images.length; i++) {
                if (!processingOrder.includes(i)) {
                    processingOrder.push(i);
                }
            }

            // Process images in the determined order
            for (const i of processingOrder) {
                // Skip already processed pages
                if (skipped.includes(i)) {
                    continue;
                }

                try {
                    // Load the current image
                    const img = await loadImage(chapter.images[i]);

                    // Check if this page should be combined with the next
                    if (img.height === 1500 && i < chapter.images.length - 1) {
                        try {
                            // Load the next image to combine
                            const nextImg = await loadImage(
                                chapter.images[i + 1],
                            );

                            // Combine the images on canvas
                            canvas.width = img.width;
                            canvas.height = img.height + nextImg.height;
                            ctx.drawImage(img, 0, 0);
                            ctx.drawImage(nextImg, 0, img.height);

                            // Store the combined image
                            processed[i] = canvas.toDataURL("image/jpeg");
                            skipped.push(i + 1); // Mark the next page as skipped

                            // Update state with each combined image
                            setProcessedImages((prev) => {
                                const updated = [...prev];
                                updated[i] = processed[i];
                                return updated;
                            });

                            // Update skip pages and effective page count together
                            setSkipPages((prev) => {
                                const newSkipPages = [...prev, i + 1];
                                // Update effective page count whenever skip pages changes
                                setEffectivePageCount(
                                    chapter.images.length - newSkipPages.length,
                                );
                                return newSkipPages;
                            });
                        } catch (nextImgError) {
                            // If next image fails, just use the current one
                            console.error(
                                `Error loading next image at index ${i + 1}:`,
                                nextImgError,
                            );
                            processed[i] =
                                `/api/image-proxy?imageUrl=${encodeURIComponent(chapter.images[i])}`;

                            setProcessedImages((prev) => {
                                const updated = [...prev];
                                updated[i] = processed[i];
                                return updated;
                            });
                        }
                    } else {
                        // Store the single image
                        processed[i] =
                            `/api/image-proxy?imageUrl=${encodeURIComponent(chapter.images[i])}`;

                        // Update state with each processed image
                        setProcessedImages((prev) => {
                            const updated = [...prev];
                            updated[i] = processed[i];
                            return updated;
                        });
                    }
                } catch (imgError) {
                    console.error(
                        `Error loading image at index ${i}:`,
                        imgError,
                    );

                    const errorImage =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' fill='%23888'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                    processed[i] = errorImage;

                    // Update state with error placeholder
                    setProcessedImages((prev) => {
                        const updated = [...prev];
                        updated[i] = processed[i];
                        return updated;
                    });
                }

                // Increment our counter
                imagesLoaded++;

                // Make initial batch available as soon as it's ready
                if (imagesLoaded === initialBatchSize && !initialPagesReady) {
                    setInitialPagesReady(true);
                }
            }

            // Final update of effective page count after all processing is done
            setEffectivePageCount(chapter.images.length - skipped.length);
        } catch (error) {
            console.error("Error in image processing:", error);
        } finally {
            setTimeout(() => {
                setIsProcessingImages(false);
            }, 500);
        }
    }, [chapter?.images, handleImageHeight, currentPage]);

    useEffect(() => {
        processImages();
    }, [processImages]);

    // Modified handlePageLoad to check image height
    const handlePageLoad = (
        e: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => {
        handleImageLoad(e, index);

        // Check image height for strip manga detection
        if (
            !hasToggledReaderModeRef.current &&
            e.currentTarget instanceof HTMLImageElement
        ) {
            handleImageHeight(e.currentTarget.naturalHeight);
        }
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

                            return (
                                <NextImage
                                    key={index}
                                    src={processedImages[index]}
                                    alt={`${chapter.title} - ${chapter.chapter} Page ${effectiveIndex + 1}`}
                                    width={700}
                                    height={1080}
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
                            console.log(page);
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
