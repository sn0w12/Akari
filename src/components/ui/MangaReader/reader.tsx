"use client";

import { Chapter, ChapterImage, HqMangaCacheItem } from "@/app/api/interfaces";
import { useCallback, useEffect, useRef, useState } from "react";
import PageReader from "./Readers/page-reader";
import StripReader from "./Readers/strip-reader";
import { FooterProvider } from "@/lib/footer-context";
import MangaReaderSkeleton from "./mangaReaderSkeleton";
import db from "@/lib/db";

interface ReaderProps {
    chapter: Chapter;
}

export interface ImageGroups {
    [groupId: number]: ChapterImage[];
    length: number;
}

function createImagePromise(url: string): Promise<ChapterImage> {
    return new Promise((resolve) => {
        const img = new Image();
        const proxyUrl = `/api/image-proxy?imageUrl=${encodeURIComponent(url)}`;

        img.onload = () => {
            resolve({
                url: proxyUrl,
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            resolve({
                url: proxyUrl,
            });
        };

        img.crossOrigin = "anonymous";
        img.src = proxyUrl;
    });
}

const badWidths = [1125, 1115];
const badHeights = [404, 400];
async function getChapterImages(chapter: Chapter): Promise<ChapterImage[]> {
    try {
        return await Promise.all(
            chapter.images.map((url) => createImagePromise(url)),
        ).then((images) =>
            images.filter((image, index) => {
                if (image.width == undefined || image.height == undefined) {
                    return false;
                }
                // Only check first and last images so we don't filter out real images
                // that are in the middle of the chapter
                if (index == 0 || index == images.length - 1) {
                    const isBadImage =
                        badWidths.includes(image.width) &&
                        badHeights.includes(image.height);
                    return !isBadImage;
                }
                return true;
            }),
        );
    } catch (error) {
        console.error("Failed to get chapter images:", error);
        return chapter.images.map((url) => ({ url }));
    }
}

export function Reader({ chapter }: ReaderProps) {
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined,
    );
    const hasCachedRef = useRef(false);
    const [combinedImages, setCombinedImages] = useState<ImageGroups>({
        length: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        async function calculateImageGroups() {
            setIsLoading(true);
            const chapterImages = await getChapterImages(chapter);
            const newCombinedImages: ImageGroups = { length: 0 };
            const cutoffHeight = 1500;
            let totalCutoffImages = 0;
            let groupIndex = 0;

            for (let i = 0; i < chapterImages.length; i++) {
                const image = chapterImages[i];

                // Safely access height with optional chaining
                const imageHeight = image.height;
                if (imageHeight && imageHeight >= cutoffHeight) {
                    totalCutoffImages++;
                }

                const lastImage = chapterImages[i - 1];
                if (lastImage === undefined) {
                    // First image - create new group
                    newCombinedImages[groupIndex] = [image];
                    newCombinedImages.length++;
                    groupIndex++;
                    continue;
                }

                // Safely check last image's height
                const lastImageHeight = lastImage.height;
                if (lastImageHeight && lastImageHeight >= cutoffHeight) {
                    // Add to the last group if the previous image was tall
                    newCombinedImages[groupIndex - 1].push(image);
                } else {
                    // Create a new group otherwise
                    newCombinedImages[groupIndex] = [image];
                    newCombinedImages.length++;
                    groupIndex++;
                }
            }

            setCombinedImages(newCombinedImages);
            if (!hasCachedRef.current) {
                console.log(
                    `Total images: ${chapterImages.length}, Cutoff images: ${totalCutoffImages}`,
                );
                setIsStripMode(totalCutoffImages >= chapterImages.length / 1.5);
            }
            setIsLoading(false);
        }

        calculateImageGroups();
    }, [chapter]);

    useEffect(() => {
        if (chapter && chapter.images.length > 0) {
            const checkStripModeCache = async () => {
                const mangaCache =
                    (await db.getCache(db.hqMangaCache, chapter.parentId)) ??
                    ({} as HqMangaCacheItem);

                // Check if the chapter's parentId is cached
                if (mangaCache?.is_strip === true) {
                    setIsStripMode(true);
                    hasCachedRef.current = true;
                    return;
                } else if (mangaCache?.is_strip === false) {
                    setIsStripMode(false);
                    hasCachedRef.current = true;
                    return;
                }
            };

            // Call the async function inside useEffect
            checkStripModeCache();
        }
    }, [chapter]);

    async function setReaderMode(isStrip: boolean) {
        setIsStripMode(isStrip);
        const mangaCache =
            (await db.getCache(db.hqMangaCache, chapter!.parentId)) ??
            ({} as HqMangaCacheItem);
        mangaCache.is_strip = isStrip;
        await db.updateCache(db.hqMangaCache, chapter!.parentId, mangaCache);
    }

    function toggleReaderMode(override: boolean = true) {
        if (isStripMode !== undefined) {
            setReaderMode(!isStripMode);
        } else {
            setReaderMode(override);
        }
    }

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        setIsInactive(false);
        inactivityTimer.current = setTimeout(() => {
            console.log("User is inactive");
            setIsInactive(true);
        }, 2000);
    }, []);

    useEffect(() => {
        // Initialize the inactivity timer
        resetInactivityTimer();

        const events = ["mousemove", "scroll", "touchstart"];
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

    if (isLoading) {
        return <MangaReaderSkeleton />;
    }

    return (
        <FooterProvider>
            <div>
                {isStripMode ? (
                    <StripReader
                        chapter={chapter}
                        toggleReaderMode={toggleReaderMode}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        images={combinedImages}
                        toggleReaderMode={toggleReaderMode}
                        isInactive={isInactive}
                    />
                )}
            </div>
        </FooterProvider>
    );
}
