"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import { Chapter } from "@/app/api/interfaces";
import PageProgress from "@/components/ui/pageProgress";
import Image from "next/image";
import { debounce } from "lodash";
import db from "@/lib/db";
import { HqMangaCacheItem } from "@/app/api/interfaces";
import { syncAllServices } from "@/lib/sync";
import MangaFooter from "./ui/MangaReader/mangaFooter";
import EndOfManga from "./ui/MangaReader/endOfManga";
import { getSetting } from "@/lib/settings";

interface ChapterReaderProps {
    isFooterVisible: boolean;
}

export default function ChapterReader({ isFooterVisible }: ChapterReaderProps) {
    const [chapterData, setChapterData] = useState<Chapter | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined,
    );
    const [timeElapsed, setTimeElapsed] = useState(0);
    const router = useRouter();
    const { id, subId } = useParams();
    const bookmarkUpdatedRef = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!chapterData || bookmarkUpdatedRef.current) return;

        const isHalfwayThrough =
            currentPage >= Math.floor(chapterData.images.length / 2);
        const hasFewImages = chapterData.images.length < 4;
        const thirtySecondsPassed = timeElapsed >= 30;

        if (
            isHalfwayThrough ||
            ((hasFewImages || isStripMode) && thirtySecondsPassed)
        ) {
            syncAllServices(chapterData);
            bookmarkUpdatedRef.current = true;
        }
    }, [chapterData, currentPage, isStripMode, timeElapsed]);

    // Detect if the majority of images have a long aspect ratio
    useEffect(() => {
        if (chapterData && chapterData.images.length > 0) {
            const maxImagesToCheck = 5; // Limit the number of images to check
            const imagesToCheck = chapterData.images.slice(0, maxImagesToCheck);

            const checkSelectedImages = async () => {
                // Fetch strip mode cache from Dexie (asynchronous operation)
                const mangaCache =
                    (await db.getCache(
                        db.hqMangaCache,
                        chapterData.parentId,
                    )) ?? ({} as HqMangaCacheItem);

                // Check if the chapter's parentId is cached
                if (mangaCache?.is_strip === true) {
                    setIsStripMode(true);
                    return;
                } else if (mangaCache?.is_strip === false) {
                    setIsStripMode(false);
                    return;
                }

                // If not cached, calculate the strip mode based on image dimensions
                let longImageCount = 0;
                const dimensionPromises = imagesToCheck.map(async (img) => {
                    try {
                        const response = await fetch(
                            `/api/get-image-dimensions?imageUrl=${encodeURIComponent(img)}`,
                        );
                        const { width, height } = await response.json();
                        const aspectRatio = height / width;
                        if (aspectRatio > 2) {
                            longImageCount += 1;
                        }
                    } catch (error) {
                        console.error(
                            `Failed to get dimensions for image ${img}:`,
                            error,
                        );
                    }
                });

                await Promise.all(dimensionPromises);

                // Determine if strip mode should be enabled and cache the result
                const isStripMode = longImageCount > imagesToCheck.length / 2;
                setIsStripMode(isStripMode);

                // Update the cache with the new value
                mangaCache.is_strip = isStripMode;
                await db.updateCache(
                    db.hqMangaCache,
                    chapterData.parentId,
                    mangaCache,
                );
            };

            // Call the async function inside useEffect
            checkSelectedImages();
        }
    }, [chapterData]);

    // Fetch the chapter data
    const fetchChapter = useCallback(async () => {
        const user_data = localStorage.getItem("accountInfo");
        const user_name = localStorage.getItem("accountName");
        const server = getSetting("mangaServer");

        const response = await fetch(
            `/api/manga/${id}/${subId}?user_data=${user_data}&user_name=${user_name}&server=${server}`,
        );
        const data = await response.json();
        const uniqueChapters: Chapter[] = Array.from(
            new Map<string, Chapter>(
                data.chapters.map((item: { value: string; label: string }) => [
                    item.value,
                    item,
                ]),
            ).values(),
        );
        data.chapters = uniqueChapters;
        setChapterData(data);
        document.title = `${data.title} - ${data.chapter}`;
    }, [id, subId]);

    const debouncedFetchChapter = useCallback(debounce(fetchChapter, 10), [
        fetchChapter,
    ]);

    useEffect(() => {
        debouncedFetchChapter();

        // Cleanup to cancel the debounced function when component unmounts or id/subId changes
        return () => {
            debouncedFetchChapter.cancel();
        };
    }, [debouncedFetchChapter]);

    // Navigate to the next page
    const nextPage = useCallback(() => {
        if (!chapterData) return;

        const isLastPage = currentPage === chapterData.images.length - 1;
        const nextChapterParts = chapterData.nextChapter.split("/");
        const nextChapterCopy = [...nextChapterParts];
        const formattedChapter = chapterData.chapter
            .toLowerCase()
            .replaceAll(" ", "-");

        console.log(nextChapterParts);

        if (currentPage < chapterData.images.length - 1) {
            setCurrentPage((prev) => prev + 1);
        } else if (isLastPage) {
            if (nextChapterCopy.pop() === formattedChapter) {
                setCurrentPage((prev) => prev + 1);
            } else if (nextChapterParts.length === 2) {
                router.push(`/manga/${chapterData.nextChapter}`);
            } else {
                setCurrentPage((prev) => prev + 1);
            }
        }
    }, [chapterData, currentPage, router]);

    // Navigate to the previous page
    const prevPage = useCallback(() => {
        if (chapterData && currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        } else if (chapterData && currentPage === 0) {
            router.push(`/manga/${chapterData.lastChapter}`);
        }
    }, [chapterData, currentPage, router]);

    // Handle key press events for navigation
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

    // Handle click on the screen for normal mode
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const screenWidth = window.innerWidth;
        const clickX = e.clientX;
        const clickY = e.clientY;
        if (clickY < 100 || clickY > window.innerHeight - 100) return;

        if (clickX > screenWidth / 2) {
            nextPage(); // Click on the right side
        } else {
            prevPage(); // Click on the left side
        }
    };

    if (!chapterData || isStripMode === undefined) {
        return <CenteredSpinner />;
    }

    // Render "strip" mode for long images
    if (isStripMode) {
        return (
            <div>
                <div
                    id="reader"
                    className="flex flex-col items-center bg-transparent"
                >
                    {chapterData.images.map((image, index) => (
                        <Image
                            key={index}
                            src={`/api/image-proxy?imageUrl=${encodeURIComponent(image)}`}
                            alt={`${chapterData.title} - ${chapterData.chapter} Page ${
                                index + 1
                            }`}
                            width={700}
                            height={1080}
                            className="object-contain w-128 z-20 relative"
                            loading="eager"
                            priority={index < 3}
                        />
                    ))}
                </div>
                <MangaFooter chapterData={chapterData} />
            </div>
        );
    }

    // Normal mode (single image navigation)
    return (
        <div className="overflow-x-hidden">
            <div
                className="flex flex-col justify-center items-center h-dvh w-screen bg-transparent"
                onClick={handleClick}
            >
                <div id="reader" className="relative max-h-dvh w-auto">
                    {chapterData.images.map((image, index) => (
                        <Image
                            key={index}
                            src={`/api/image-proxy?imageUrl=${encodeURIComponent(image)}`}
                            alt={`${chapterData.title} - ${chapterData.chapter} Page ${index + 1}`}
                            width={700}
                            height={1080}
                            loading="eager"
                            priority={index === 1}
                            className={`object-contain max-h-dvh w-full h-full cursor-pointer z-20 relative ${index !== currentPage ? "hidden" : ""}`}
                        />
                    ))}
                    <EndOfManga
                        title={chapterData.title}
                        identifier={chapterData.parentId}
                        className={`${chapterData.images.length !== currentPage ? "hidden" : ""}`}
                    />
                </div>
                <div
                    className={`lg:opacity-100 ${isFooterVisible ? "opacity-100" : "opacity-0"}`}
                >
                    <PageProgress
                        currentPage={currentPage}
                        totalPages={chapterData.images.length}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            </div>
            <div
                className={`footer ${isFooterVisible ? "footer-visible" : ""}`}
            >
                <MangaFooter chapterData={chapterData} />
            </div>
        </div>
    );
}
