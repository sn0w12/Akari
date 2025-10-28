"use client";

import Image from "next/image";
import MangaFooter from "../manga-footer";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncAllServices } from "@/lib/manga/sync";
import { useQueryClient } from "@tanstack/react-query";
import { useFooterVisibility } from "@/contexts/footer-context";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

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

interface StripReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    toggleReaderMode: () => void;
    bgColor: string;
    setBookmarkState: (state: boolean | null) => void;
}

export default function StripReader({
    chapter,
    toggleReaderMode,
    bgColor,
    setBookmarkState,
}: StripReaderProps) {
    const router = useRouter();
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [distanceFromBottom, setDistanceFromBottom] = useState(1000);
    const stripWidth = useSetting("stripWidth");
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);
    const scrollHandlerRef = useRef<(() => void) | undefined>(undefined);
    const mountTimeRef = useRef<number>(Date.now());
    const { isFooterVisible } = useFooterVisibility();
    const queryClient = useQueryClient();

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
                    scrollHandlerRef.current
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
            syncAllServices(chapter).then((success) => {
                setBookmarkState(success);
                if (success) {
                    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
                }
            });
            bookmarkUpdatedRef.current = true;
        }

        if (prefetch && chapter.nextChapter && !hasPrefetchedRef.current) {
            router.prefetch(`/manga/${chapter.nextChapter}?_prefetch=1`);
            hasPrefetchedRef.current = true;
        }
    }, [scrollPercentage, chapter, router, setBookmarkState, queryClient]);

    return (
        <div>
            <div
                id="reader"
                className={`flex flex-col items-center overflow-auto transition-colors duration-500 ${bgColor}`}
            >
                {chapter.images.map((img, index) => (
                    <Image
                        key={index}
                        src={img}
                        alt={`${chapter.title} - ${chapter.title} Page ${
                            index + 1
                        }`}
                        width={720}
                        height={1500}
                        className={cn(
                            "object-contain z-20 relative max-w-full",
                            {
                                "rounded-t": index === 0,
                                "rounded-b":
                                    index === chapter.images.length - 1,
                            }
                        )}
                        style={{
                            width: `calc(var(--spacing) * ${stripWidth})`,
                        }}
                        loading={"eager"}
                        priority={index < 3}
                    />
                ))}
            </div>
            <div
                className={`footer ${
                    isFooterVisible && distanceFromBottom > 200
                        ? "footer-visible"
                        : ""
                }`}
            >
                <MangaFooter
                    chapter={chapter}
                    toggleReaderMode={toggleReaderMode}
                />
            </div>
            <MangaFooter
                chapter={chapter}
                toggleReaderMode={toggleReaderMode}
            />
        </div>
    );
}
