"use client";

import { Chapter } from "@/app/api/interfaces";
import Image from "next/image";
import MangaFooter from "../mangaFooter";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncAllServices } from "@/lib/sync";

function throttle(this: any, func: Function, limit: number) {
    let lastFunc: number;
    let lastRan: number;
    return function (this: any, ...args: any[]) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = window.setTimeout(
                () => {
                    if (Date.now() - lastRan >= limit) {
                        func.apply(this, args);
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
    isSidebarCollapsed: boolean;
}

export default function StripReader({
    chapter,
    isFooterVisible,
    handleImageLoad,
    toggleReaderMode,
    isSidebarCollapsed,
}: StripReaderProps) {
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [distanceFromBottom, setDistanceFromBottom] = useState(1000);
    const bookmarkUpdatedRef = useRef(false);
    const router = useRouter();
    const hasPrefetchedRef = useRef(false);
    const scrollHandlerRef = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
        // Use requestAnimationFrame for smoother performance
        const calculateScrollMetrics = () => {
            const element = document.documentElement;
            const scrollTop = element.scrollTop || document.body.scrollTop;
            const scrollHeight =
                element.scrollHeight || document.body.scrollHeight;
            const clientHeight = element.clientHeight;

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

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => {
            if (scrollHandlerRef.current) {
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

        if (halfWay && !bookmarkUpdatedRef.current) {
            syncAllServices(chapter);
            bookmarkUpdatedRef.current = true;
        }

        if (prefetch && chapter.nextChapter && !hasPrefetchedRef.current) {
            router.prefetch(`/manga/${chapter.nextChapter}`);
            hasPrefetchedRef.current = true;
        }
    }, [scrollPercentage, chapter]);

    return (
        <div>
            <div
                id="reader"
                className="flex flex-col items-center bg-transparent"
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
