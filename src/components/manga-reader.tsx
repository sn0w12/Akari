"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageReader from "./manga-reader/readers/page-reader";
import StripReader from "./manga-reader/readers/strip-reader";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import { ChapterInfo } from "./manga-reader/chapter-info";
import { useStorage } from "@/lib/storage";

interface ReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
}

function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let lastFunc: number | undefined;
    let lastRan: number | undefined;

    return function (...args: Parameters<T>): void {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = window.setTimeout(() => {
                if (Date.now() - lastRan! >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

export function Reader({ chapter }: ReaderProps) {
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined
    );
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    const [bookmarkState, setBookmarkState] = useState<boolean | null>(null);
    const [bgColor, setBgColor] = useState<string>("bg-background");

    const [scrollMetrics, setScrollMetrics] = useState({
        pixels: 0,
        percentage: 0,
    });
    const scrollHandlerRef = useRef<(() => void) | undefined>(undefined);
    const readerModeStorage = useStorage("readerMode");

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

    useEffect(() => {
        const stored = readerModeStorage.get({
            mangaId: chapter.mangaId,
            chapterId: chapter.id,
        });
        if (stored && typeof stored.isStripMode === "boolean") {
            setIsStripMode(stored.isStripMode);
        } else {
            setIsStripMode(["Manwha", "Manhua"].includes(chapter.type));
        }
    }, [chapter.mangaId, chapter.id, chapter.type, readerModeStorage]);

    async function setReaderMode(isStrip: boolean) {
        setIsStripMode(isStrip);
        readerModeStorage.set(
            { isStripMode: isStrip },
            { mangaId: chapter.mangaId, chapterId: chapter.id }
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

    useEffect(() => {
        const mainElement = document.getElementById(
            "scroll-element"
        ) as HTMLElement;
        if (!mainElement) return;

        // Use requestAnimationFrame for smoother performance
        const calculateScrollMetrics = () => {
            const mainScrollTop = mainElement.scrollTop;
            const documentScrollTop = document.documentElement.scrollTop;

            // Determine which scroll values to use based on the condition
            const useDocumentScroll =
                mainScrollTop === 0 && documentScrollTop !== 0;

            const scrollTop = useDocumentScroll
                ? documentScrollTop
                : mainScrollTop;

            const scrollHeight = useDocumentScroll
                ? document.documentElement.scrollHeight
                : mainElement.scrollHeight;

            const clientHeight = useDocumentScroll
                ? window.innerHeight
                : mainElement.clientHeight;

            // Calculate percentage
            const percentage =
                (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollMetrics({
                pixels: scrollTop,
                percentage: Math.min(100, Math.max(0, percentage)),
            });
        };

        const handleScroll = throttle(() => {
            requestAnimationFrame(calculateScrollMetrics);
        }, 300);

        scrollHandlerRef.current = handleScroll;

        mainElement.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => {
            if (scrollHandlerRef.current) {
                mainElement.removeEventListener(
                    "scroll",
                    scrollHandlerRef.current
                );
                window.removeEventListener("scroll", scrollHandlerRef.current);
            }
        };
    }, []);

    return (
        <>
            <BreadcrumbSetter
                orig={chapter.mangaId}
                title={chapter.mangaTitle}
            />
            <div>
                <ChapterInfo chapter={chapter} />
                {isStripMode ? (
                    <StripReader
                        chapter={chapter}
                        scrollMetrics={scrollMetrics}
                        toggleReaderMode={toggleReaderMode}
                        bgColor={bgColor}
                        setBookmarkState={setBookmarkState}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        scrollMetrics={scrollMetrics}
                        toggleReaderMode={toggleReaderMode}
                        isInactive={isInactive}
                        bgColor={bgColor}
                        setBookmarkState={setBookmarkState}
                    />
                )}
            </div>
        </>
    );
}
