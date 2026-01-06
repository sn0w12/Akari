"use client";

import Image from "next/image";
import MangaFooter from "../manga-footer";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncAllServices } from "@/lib/manga/sync";
import { useQueryClient } from "@tanstack/react-query";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import StripPageProgress from "../strip-page-progress";

interface StripReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    scrollMetrics: {
        pixels: number;
        percentage: number;
        useDocumentScroll: boolean;
        mainTop: number;
        clientHeight: number;
    };
    toggleReaderMode: () => void;
    setBookmarkState: (state: boolean | null) => void;
}

export default function StripReader({
    chapter,
    scrollMetrics,
    toggleReaderMode,
    setBookmarkState,
}: StripReaderProps) {
    const router = useRouter();
    const stripWidth = useSetting("stripWidth");
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);
    const mountTimeRef = useRef<number>(0);
    const queryClient = useQueryClient();
    const lastImageRef = useRef<HTMLImageElement>(null);
    const readerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(0);

    useEffect(() => {
        mountTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (
            !lastImageRef.current ||
            !readerRef.current ||
            imagesLoaded !== chapter.images.length
        )
            return;
        const { useDocumentScroll, mainTop, clientHeight } = scrollMetrics;
        const firstImage = readerRef.current.querySelector(
            "img"
        ) as HTMLImageElement;
        if (!firstImage) return;
        const firstImageTop = useDocumentScroll
            ? firstImage.offsetTop
            : firstImage.offsetTop - mainTop;
        const lastImage = lastImageRef.current;
        const lastImageBottom = useDocumentScroll
            ? lastImage.offsetTop + lastImage.offsetHeight
            : lastImage.offsetTop + lastImage.offsetHeight - mainTop;
        const totalHeight = lastImageBottom - clientHeight - firstImageTop;
        const currentPosition = scrollMetrics.pixels - firstImageTop;
        const newProgress = Math.max(
            0,
            Math.min(1, currentPosition / totalHeight)
        );

        queueMicrotask(() => {
            setProgress(newProgress);
        });
    }, [scrollMetrics, imagesLoaded, chapter.images.length]);

    useEffect(() => {
        if (!chapter) return;
        const halfWay = progress > 0.5;
        const prefetch = progress > 0.8;
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
            router.prefetch(`/manga/${chapter.nextChapter}`);
            hasPrefetchedRef.current = true;
        }
    }, [progress, chapter, router, setBookmarkState, queryClient]);

    return (
        <div>
            <div
                id="reader"
                ref={readerRef}
                className={`flex flex-col items-center transition-colors duration-500`}
            >
                {chapter.images.map((img, index) => (
                    <Image
                        key={index}
                        ref={
                            index === chapter.images.length - 1
                                ? lastImageRef
                                : null
                        }
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
                        preload={index === 0}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        unoptimized={true}
                        onLoad={() => setImagesLoaded((prev) => prev + 1)}
                    />
                ))}
            </div>
            <div className={`sm:opacity-0 lg:opacity-100`}>
                <StripPageProgress
                    progress={progress}
                    hidden={progress === 1}
                />
            </div>
            <MangaFooter
                chapter={chapter}
                toggleReaderMode={toggleReaderMode}
            />
        </div>
    );
}
