"use client";

import { useEffect, useState, useRef } from "react";
import { Chapter } from "@/app/api/interfaces";
import db from "@/lib/db";
import { HqMangaCacheItem } from "@/app/api/interfaces";
import MangaReaderSkeleton from "./mangaReaderSkeleton";
import { HeaderComponent } from "@/components/Header";
import StripReader from "./Reader/strip";
import PageReader from "./Reader/page";

interface ReaderProps {
    chapter: Chapter;
}

export default function Reader({ chapter }: ReaderProps) {
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined,
    );
    const [firstImageLoaded, setFirstImageLoaded] = useState<boolean>(false);
    const [isHeaderVisible, setHeaderVisible] = useState(false);
    const [isHoveringHeader, setHoveringHeader] = useState(false);
    const [isFooterVisible, setFooterVisible] = useState(false);
    const [isHoveringFooter, setHoveringFooter] = useState(false);
    const longImageCountRef = useRef(0);
    const imageCountRef = useRef(0);

    // Detect if the majority of images have a long aspect ratio
    useEffect(() => {
        if (chapter && chapter.images.length > 0) {
            const checkStripModeCache = async () => {
                // Fetch strip mode cache from Dexie (asynchronous operation)
                const mangaCache =
                    (await db.getCache(db.hqMangaCache, chapter.parentId)) ??
                    ({} as HqMangaCacheItem);

                // Check if the chapter's parentId is cached
                if (mangaCache?.is_strip === true) {
                    setIsStripMode(true);
                    return;
                } else if (mangaCache?.is_strip === false) {
                    setIsStripMode(false);
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

    async function toggleReaderMode() {
        if (isStripMode !== undefined) {
            setReaderMode(!isStripMode);
        }
    }

    const handleImageLoad = async (
        event: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => {
        if (index === 0) setFirstImageLoaded(true);
        if (isStripMode !== undefined) return;

        const imageCutoff = Math.floor(chapter!.images.length / 2);

        const imgElement = event.currentTarget;
        const aspectRatio = imgElement.naturalHeight / imgElement.naturalWidth;
        imageCountRef.current += 1;
        if (aspectRatio > 2) {
            longImageCountRef.current += 1;
        }

        if (
            longImageCountRef.current == 5 ||
            longImageCountRef.current > imageCutoff
        ) {
            setReaderMode(true);
        } else if (imageCountRef.current === imageCutoff) {
            setReaderMode(false);
        }
    };

    useEffect(() => {
        const isSidebarPresent = () =>
            document.getElementById("sidebar") !== null;

        const handleMouseMove = (e: MouseEvent) => {
            const sidebarVisible = isSidebarPresent();
            if (e.clientY < 175 && !sidebarVisible) {
                setHeaderVisible(true);
            } else if (!isHoveringHeader) {
                setHeaderVisible(false);
            }

            if (e.clientY > window.innerHeight - 175 && !sidebarVisible) {
                setFooterVisible(true);
            } else if (!isHoveringFooter) {
                setFooterVisible(false);
            }
        };

        const handleHeaderMouseEnter = () => {
            setHoveringHeader(true);
            setHeaderVisible(true);
        };

        const handleHeaderMouseLeave = () => {
            setHoveringHeader(false);
            setHeaderVisible(false);
        };

        const handleFooterMouseEnter = () => {
            setHoveringFooter(true);
            setFooterVisible(true);
        };

        const handleFooterMouseLeave = () => {
            setHoveringFooter(false);
            setFooterVisible(false);
        };

        window.addEventListener("mousemove", handleMouseMove);

        const headerElement = document.querySelector(".header");
        if (headerElement) {
            headerElement.addEventListener(
                "mouseenter",
                handleHeaderMouseEnter,
            );
            headerElement.addEventListener(
                "mouseleave",
                handleHeaderMouseLeave,
            );
        }

        const footerElement = document.querySelector(".footer");
        if (footerElement) {
            footerElement.addEventListener(
                "mouseenter",
                handleFooterMouseEnter,
            );
            footerElement.addEventListener(
                "mouseleave",
                handleFooterMouseLeave,
            );
        }

        const checkForPopupElement = () => {
            const popupElement = document.querySelector(".manga-title");
            if (popupElement) {
                popupElement.addEventListener(
                    "mouseenter",
                    handleHeaderMouseEnter,
                );
                popupElement.addEventListener(
                    "mouseleave",
                    handleHeaderMouseLeave,
                );
            } else {
                setTimeout(checkForPopupElement, 100);
            }
        };

        checkForPopupElement();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (headerElement) {
                headerElement.removeEventListener(
                    "mouseenter",
                    handleHeaderMouseEnter,
                );
                headerElement.removeEventListener(
                    "mouseleave",
                    handleHeaderMouseLeave,
                );
            }
            if (footerElement) {
                footerElement.removeEventListener(
                    "mouseenter",
                    handleFooterMouseEnter,
                );
                footerElement.removeEventListener(
                    "mouseleave",
                    handleFooterMouseLeave,
                );
            }
            const popupElement = document.querySelector(".manga-title");
            if (popupElement) {
                popupElement.removeEventListener(
                    "mouseenter",
                    handleHeaderMouseEnter,
                );
                popupElement.removeEventListener(
                    "mouseleave",
                    handleHeaderMouseLeave,
                );
            }
        };
    }, [isHoveringHeader, isHoveringFooter]);

    return (
        <>
            <div
                className={`header ${isHeaderVisible ? "header-visible" : ""}`}
            >
                <HeaderComponent />
            </div>
            <div className={`${firstImageLoaded ? "hidden" : ""}`}>
                <MangaReaderSkeleton />
            </div>
            <div className={`${firstImageLoaded ? "" : "hidden"}`}>
                {isStripMode ? (
                    <StripReader
                        chapter={chapter}
                        isFooterVisible={isFooterVisible}
                        handleImageLoad={handleImageLoad}
                        toggleReaderMode={toggleReaderMode}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        isFooterVisible={isFooterVisible}
                        handleImageLoad={handleImageLoad}
                        toggleReaderMode={toggleReaderMode}
                    />
                )}
            </div>
        </>
    );
}
