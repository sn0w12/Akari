"use client";

import { Chapter, ChapterImage } from "@/types/manga";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageReader from "./readers/page-reader";
import StripReader from "./readers/strip-reader";
import { FooterProvider } from "@/contexts/footer-context";
import MangaReaderSkeleton from "./skeleton";
import { fetchApi, isApiErrorResponse } from "@/lib/api";

interface ReaderProps {
    chapter: Chapter;
}

export interface ImageGroups {
    [groupId: number]: ChapterImage[];
    length: number;
}

const badAspectRatio = 2.78;
const aspectRatioTolerance = 0.01;
async function getChapterImages(
    chapter: Chapter,
    fetchSizes: boolean = true
): Promise<ChapterImage[]> {
    if (!fetchSizes) {
        return chapter.images.map((url) => ({
            url: `/api/v1/image-proxy?imageUrl=${encodeURIComponent(url)}`,
        }));
    }

    try {
        const baseUrl = encodeURIComponent(
            chapter.images[0].split("/").slice(0, -1).join("/")
        );
        const imageNames = chapter.images.map((url) =>
            encodeURIComponent(url.split("/").pop() || "")
        );

        const chunkSize = 30;
        const chunks = [];
        for (let i = 0; i < imageNames.length; i += chunkSize) {
            chunks.push(imageNames.slice(i, i + chunkSize));
        }

        // Fetch sizes for each chunk in parallel
        const allSizes: { url: string; width: number; height: number }[] = [];
        for (const chunk of chunks) {
            const result = await fetchApi<
                { url: string; width: number; height: number }[]
            >(`/api/v1/image-sizes?baseUrl=${baseUrl}&imgs=${chunk.join(",")}`);
            if (isApiErrorResponse(result)) {
                console.error(result.data.message);
                return [];
            }
            if (Array.isArray(result.data)) {
                allSizes.push(...result.data);
            }
        }

        const images: ChapterImage[] = chapter.images.map((url, index) => {
            const proxyUrl = `/api/v1/image-proxy?imageUrl=${encodeURIComponent(
                url
            )}`;
            let size:
                | { url: string; width: number; height: number }
                | undefined = undefined;
            if (Array.isArray(allSizes)) {
                size = allSizes[index];
            }
            return {
                url: proxyUrl,
                width: size?.width,
                height: size?.height,
            };
        });

        const finalFiltered = images.filter((image, index, array) => {
            if (image.width == undefined || image.height == undefined) {
                return false;
            }
            if (index === 0 || index === array.length - 1) {
                const aspectRatio = image.width / image.height;
                const isBadImage =
                    Math.abs(aspectRatio - badAspectRatio) <=
                    aspectRatioTolerance;
                return !isBadImage;
            }
            return true;
        });

        return finalFiltered;
    } catch (error) {
        console.error("Failed to get chapter images:", error);
        return chapter.images.map((url) => ({
            url: `/api/v1/image-proxy?imageUrl=${encodeURIComponent(url)}`,
        }));
    }
}

export function Reader({ chapter }: ReaderProps) {
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined
    );
    const hasCachedRef = useRef(false);
    const [chapterImages, setChapterImages] = useState<ChapterImage[]>([]);
    const [combinedImages, setCombinedImages] = useState<ImageGroups>({
        length: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    const [bookmarkState, setBookmarkState] = useState<boolean | null>(null);
    const [bgColor, setBgColor] = useState<string>("bg-background");

    useEffect(() => {
        switch (bookmarkState) {
            case true:
                setBgColor("bg-accent-positive/40");
                break;
            case false:
                setBgColor("bg-destructive");
                break;
            default:
                setBgColor("bg-background");
        }
    }, [bookmarkState]);

    const localstorageId = useMemo(
        () => `readerMode-${chapter.parentId}`,
        [chapter.parentId]
    );

    useEffect(() => {
        async function calculateImageGroups() {
            setIsLoading(true);
            const userChosenMode = localStorage.getItem(localstorageId);
            let isStrip = false;
            if (userChosenMode === "strip") {
                isStrip = true;
                hasCachedRef.current = true;
            } else if (userChosenMode === "page") {
                isStrip = false;
                hasCachedRef.current = true;
            } else {
                // No cache, use chapter.type
                if (chapter.type !== null && chapter.type !== "Manga") {
                    isStrip = true;
                } else {
                    isStrip = false;
                }
            }

            const chapterImages = await getChapterImages(chapter, !isStrip);
            setChapterImages(chapterImages);
            if (!isStrip) {
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
                if (!hasCachedRef.current && !chapter.type) {
                    isStrip = totalCutoffImages >= chapterImages.length / 1.5;
                }
            } else {
                setCombinedImages({ length: 0 });
            }

            setIsStripMode(isStrip);
            setIsLoading(false);
        }

        calculateImageGroups();
    }, [chapter, localstorageId]);

    async function setReaderMode(isStrip: boolean) {
        setIsStripMode(isStrip);
        localStorage.setItem(localstorageId, isStrip ? "strip" : "page");
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
        <FooterProvider stripMode={isStripMode}>
            <div>
                {isStripMode ? (
                    <StripReader
                        chapter={chapter}
                        images={chapterImages}
                        toggleReaderMode={toggleReaderMode}
                        bgColor={bgColor}
                        setBookmarkState={setBookmarkState}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        images={combinedImages}
                        toggleReaderMode={toggleReaderMode}
                        isInactive={isInactive}
                        bgColor={bgColor}
                        setBookmarkState={setBookmarkState}
                    />
                )}
            </div>
        </FooterProvider>
    );
}
