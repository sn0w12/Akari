"use client";

import { useEffect, useState, useRef } from "react";
import { Chapter } from "@/app/api/interfaces";
import db from "@/lib/db";
import { HqMangaCacheItem } from "@/app/api/interfaces";
import MangaReaderSkeleton from "./mangaReaderSkeleton";
import { HeaderComponent } from "@/components/Header";
import StripReader from "./Reader/strip";
import PageReader from "./Reader/page";
import { useSidebar } from "../sidebar";

interface ReaderProps {
    chapter: Chapter;
}

export default function Reader({ chapter }: ReaderProps) {
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined,
    );
    const [firstImageLoaded, setFirstImageLoaded] = useState<boolean>(false);
    const [isFooterVisible, setFooterVisible] = useState(false);
    const [isHoveringFooter, setHoveringFooter] = useState(false);
    const longImageCountRef = useRef(0);
    const imageCountRef = useRef(0);
    const { state: sidebarState } = useSidebar();
    const isSidebarCollapsed = sidebarState === "collapsed";

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

    async function toggleReaderMode(override: boolean = true) {
        if (isStripMode !== undefined) {
            setReaderMode(!isStripMode);
        } else {
            setReaderMode(override);
        }
    }

    const handleImageLoad = async (
        event: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => {
        if (index === 0) setFirstImageLoaded(true);
        if (isStripMode !== undefined) return;

        const imgElement = event.currentTarget;
        const height = imgElement.naturalHeight;
        imageCountRef.current += 1;
        if (height >= 1500) {
            longImageCountRef.current += 1;
        }

        if (longImageCountRef.current >= 2) {
            setReaderMode(true);
        } else {
            setReaderMode(false);
        }
    };

    useEffect(() => {
        const isSidebarPresent = () =>
            document.getElementById("sidebar") !== null;
        const isSidebarContextPresent = () =>
            document.getElementById("sidebar-context") !== null;
        const isChapterSelectorPresent = () =>
            document.getElementById("chapter-selector") !== null;

        const handleMouseMove = (e: MouseEvent) => {
            const sidebarVisible = isSidebarPresent();
            const sidebarContextVisible = isSidebarContextPresent();
            const chapterSelectorVisible = isChapterSelectorPresent();

            if (
                (e.clientY > window.innerHeight - 175 && !sidebarVisible) ||
                chapterSelectorVisible
            ) {
                setFooterVisible(true);
            } else if (!isHoveringFooter) {
                setFooterVisible(false);
            }
        };

        const handleFooterMouseEnter = () => {
            setHoveringFooter(true);
        };

        const handleFooterMouseLeave = () => {
            setHoveringFooter(false);
        };

        window.addEventListener("mousemove", handleMouseMove);

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

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
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
        };
    }, [isHoveringFooter, isStripMode]);

    return (
        <>
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
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        isFooterVisible={isFooterVisible}
                        handleImageLoad={handleImageLoad}
                        toggleReaderMode={toggleReaderMode}
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                )}
            </div>
        </>
    );
}
