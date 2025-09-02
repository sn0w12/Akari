"use client";

import { Chapter, ChapterImage } from "@/app/api/interfaces";
import { useCallback, useEffect, useRef, useState } from "react";
import PageReader from "./Readers/page-reader";
import StripReader from "./Readers/strip-reader";
import { FooterProvider } from "@/lib/footer-context";
import MangaReaderSkeleton from "./mangaReaderSkeleton";
import Toast from "@/lib/toastWrapper";

interface ReaderProps {
    chapter: Chapter;
}

export interface ImageGroups {
    [groupId: number]: ChapterImage[];
    length: number;
}

function createImagePromise(url: string, index: number): Promise<ChapterImage> {
    return new Promise((resolve) => {
        const img = new Image();
        const proxyUrl = `/api/image-proxy?imageUrl=${encodeURIComponent(url)}`;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg");
                resolve({
                    url: dataUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
            } else {
                resolve({
                    url: proxyUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
            }
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            new Toast(`Failed to load image: ${index}`, "error");
            resolve({
                url: proxyUrl,
            });
        };

        img.crossOrigin = "anonymous";
        img.src = proxyUrl;
    });
}

const badAspectRatio = 2.78;
const aspectRatioTolerance = 0.01;
async function getChapterImages(chapter: Chapter): Promise<ChapterImage[]> {
    try {
        const images = await Promise.all(
            chapter.images.map((url, index) => createImagePromise(url, index)),
        );

        const filteredByGif = images
            .map((image, index) => ({ image, originalIndex: index }))
            .filter(
                ({ originalIndex }) =>
                    !chapter.images[originalIndex]
                        .toLowerCase()
                        .split("?")[0]
                        .endsWith(".gif"),
            );

        // Then, filter based on aspect ratio for first and last
        const finalFiltered = filteredByGif
            .filter(({ image }, index, array) => {
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
            })
            .map(({ image }) => image);

        return finalFiltered;
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
    const [chapterImages, setChapterImages] = useState<ChapterImage[]>([]);
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
            setChapterImages(chapterImages);
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
                const isStrip =
                    chapter.type !== null
                        ? chapter.type !== "Manga"
                        : totalCutoffImages >= chapterImages.length / 1.5;
                setIsStripMode(isStrip);
            }
            setIsLoading(false);
        }

        calculateImageGroups();
    }, [chapter]);

    useEffect(() => {
        if (chapter && chapter.images.length > 0) {
            const checkStripModeCache = async () => {
                const userChosenMode = localStorage.getItem("readerMode");
                const isStrip =
                    userChosenMode === "strip"
                        ? true
                        : userChosenMode === "page"
                          ? false
                          : null;

                // Check if the chapter's parentId is cached
                if (isStrip === true) {
                    setIsStripMode(true);
                    hasCachedRef.current = true;
                    return;
                } else if (isStrip === false) {
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
        localStorage.setItem("readerMode", isStrip ? "strip" : "page");
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
                        images={chapterImages}
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
