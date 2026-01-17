"use client";

import { useBorderColor } from "@/contexts/border-color-context";
import { getSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { useCallback, useEffect, useRef, useState } from "react";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import { ViewManga } from "./manga-details/view-manga";
import PageReader from "./manga-reader/readers/page-reader";
import StripReader from "./manga-reader/readers/strip-reader";

interface ReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
}

export function Reader({ chapter }: ReaderProps) {
    const readerModeStorage = useStorage("readerMode");
    const { flashColor } = useBorderColor();
    const [isStripMode, setIsStripMode] = useState<boolean>(() => {
        const stored = readerModeStorage.get({
            mangaId: chapter.mangaId,
            chapterId: chapter.id,
        });
        if (stored && typeof stored.isStripMode === "boolean") {
            return stored.isStripMode;
        }

        const readerType = getSetting("readerType");
        if (readerType === "page") return false;
        if (readerType === "strip") return true;

        return ["Manwha", "Manhua"].includes(chapter.type);
    });
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    const [bookmarkState, setBookmarkState] = useState<boolean | null>(null);
    useEffect(() => {
        if (bookmarkState !== null) {
            flashColor(
                bookmarkState ? "border-accent-positive" : "border-destructive",
            );
        }
    }, [bookmarkState, flashColor]);

    const [scrollMetrics, setScrollMetrics] = useState({
        pixels: 0,
        percentage: 0,
        useDocumentScroll: false,
        mainTop: 0,
        clientHeight: 0,
    });

    async function setReaderMode(isStrip: boolean) {
        setIsStripMode(isStrip);
        readerModeStorage.set(
            { isStripMode: isStrip },
            { mangaId: chapter.mangaId, chapterId: chapter.id },
        );
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
        inactivityTimer.current = setTimeout(() => {
            setIsInactive(true);
        }, 2000);

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

    const calculateScrollMetrics = (mainElement: HTMLElement) => {
        const mainScrollTop = mainElement.scrollTop;
        const documentScrollTop = document.documentElement.scrollTop;
        const mainTop = mainElement.offsetTop;

        // Determine which scroll values to use based on the condition
        const useDocumentScroll =
            mainScrollTop === 0 && documentScrollTop !== 0;

        const scrollTop = useDocumentScroll ? documentScrollTop : mainScrollTop;

        const scrollHeight = useDocumentScroll
            ? document.documentElement.scrollHeight
            : mainElement.scrollHeight;

        const clientHeight = useDocumentScroll
            ? window.innerHeight
            : mainElement.clientHeight;

        // Calculate percentage
        const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollMetrics({
            pixels: scrollTop,
            percentage: Math.min(100, Math.max(0, percentage)),
            useDocumentScroll,
            mainTop,
            clientHeight,
        });
    };

    const handleScroll = useThrottledCallback(
        (mainElement: HTMLElement) => {
            calculateScrollMetrics(mainElement);
        },
        {
            wait: 100,
        },
    );

    useEffect(() => {
        const mainElement = document.getElementById(
            "scroll-element",
        ) as HTMLElement;
        if (!mainElement) return;
        const controller = new AbortController();

        mainElement.addEventListener(
            "scroll",
            () => handleScroll(mainElement),
            { passive: true, signal: controller.signal },
        );
        window.addEventListener("scroll", () => handleScroll(mainElement), {
            passive: true,
            signal: controller.signal,
        });
        handleScroll(mainElement);
        return () => {
            controller.abort();
        };
    }, [handleScroll]);

    return (
        <>
            <BreadcrumbSetter
                orig={chapter.mangaId}
                title={chapter.mangaTitle}
            />
            <ViewManga mangaId={chapter.mangaId} />
            <div>
                {isStripMode ? (
                    <StripReader
                        chapter={chapter}
                        scrollMetrics={scrollMetrics}
                        toggleReaderMode={toggleReaderMode}
                        setBookmarkState={setBookmarkState}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        scrollMetrics={scrollMetrics}
                        toggleReaderMode={toggleReaderMode}
                        isInactive={isInactive}
                        setBookmarkState={setBookmarkState}
                    />
                )}
            </div>
        </>
    );
}
