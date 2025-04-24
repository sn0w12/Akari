"use client";

import { Chapter } from "@/app/api/interfaces";
import Image from "next/image";
import MangaFooter from "../mangaFooter";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncAllServices } from "@/lib/sync";

function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number,
): (...args: Parameters<T>) => void {
    let lastFunc: number | undefined;
    let lastRan: number | undefined;

    return function (...args: Parameters<T>): void {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = window.setTimeout(
                () => {
                    if (Date.now() - lastRan! >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                },
                limit - (Date.now() - lastRan),
            );
        }
    };
}

interface StripReaderProps {
    chapter: Chapter;
    isFooterVisible: boolean;
    handleImageLoad: (
        e: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => void;
    toggleReaderMode: () => void;
}

export default function StripReader({
    chapter,
    isFooterVisible,
    handleImageLoad,
    toggleReaderMode,
}: StripReaderProps) {
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [distanceFromBottom, setDistanceFromBottom] = useState(1000);
    const bookmarkUpdatedRef = useRef(false);
    const router = useRouter();
    const hasPrefetchedRef = useRef(false);
    const scrollHandlerRef = useRef<(() => void) | undefined>(undefined);
    const mountTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const mainElement = document.getElementById(
            "scroll-element",
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
            console.log("Scroll Percentage:", percentage);
            setScrollPercentage(Math.min(100, Math.max(0, percentage)));

            // Calculate pixels from bottom
            const bottomDistance = scrollHeight - (scrollTop + clientHeight);
            setDistanceFromBottom(Math.max(0, bottomDistance));
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
                    scrollHandlerRef.current,
                );
                window.removeEventListener("scroll", scrollHandlerRef.current);
            }
            bookmarkUpdatedRef.current = false;
            hasPrefetchedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!chapter) return;
        const halfWay = scrollPercentage > 50;
        const prefetch = scrollPercentage > 80;
        const currentTime = Date.now();
        const timeElapsed = currentTime - mountTimeRef.current;
        const minSyncTime = 5000; // 5 seconds minimum before syncing

        if (
            halfWay &&
            !bookmarkUpdatedRef.current &&
            timeElapsed >= minSyncTime
        ) {
            syncAllServices(chapter);
            bookmarkUpdatedRef.current = true;
        }

        if (prefetch && chapter.nextChapter && !hasPrefetchedRef.current) {
            router.prefetch(`/manga/${chapter.nextChapter}`);
            hasPrefetchedRef.current = true;
        }
    }, [scrollPercentage, chapter, router]);

    return (
        <div>
            <div
                id="reader"
                className="flex flex-col items-center bg-transparent overflow-auto"
            >
                {chapter.images.map((image, index) => (
                    <Image
                        key={index}
                        src={`/api/image-proxy?imageUrl=${encodeURIComponent(image)}`}
                        alt={`${chapter.title} - ${chapter.chapter} Page ${index + 1}`}
                        width={700}
                        height={1080}
                        className="object-contain w-128 z-20 relative"
                        loading={"eager"}
                        priority={index < 3}
                        onLoad={(e) => handleImageLoad(e, index)}
                    />
                ))}
            </div>
            <div
                className={`footer ${isFooterVisible && distanceFromBottom > 200 ? "footer-visible" : ""}`}
            >
                <MangaFooter
                    chapterData={chapter}
                    toggleReaderMode={toggleReaderMode}
                />
            </div>
            <MangaFooter
                chapterData={chapter}
                toggleReaderMode={toggleReaderMode}
            />
        </div>
    );
}
