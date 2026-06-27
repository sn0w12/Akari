import { Image } from "@/components/image";
import { syncAllServices } from "@/lib/manga/sync";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChapterInfo } from "../chapter-info";
import MangaFooter from "../manga-footer";
import StripPageProgress from "../strip-page-progress";
import { useRouter } from "@tanstack/react-router";

interface StripReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    toggleReaderMode: () => void;
    setBookmarkState: (state: boolean | null) => void;
}

export default function StripReader({
    chapter,
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
    const [loadedImages, setLoadedImages] = useState(0);
    const imagesLoadedRef = useRef(0);

    useEffect(() => {
        mountTimeRef.current = Date.now();
        bookmarkUpdatedRef.current = false;
        hasPrefetchedRef.current = false;
        imagesLoadedRef.current = 0;
        setLoadedImages(0);
        setProgress(0);
    }, [chapter.id]);

    useEffect(() => {
        if (!readerRef.current) return;

        const completeImages = Array.from(
            readerRef.current.querySelectorAll("img"),
        ).filter((img) => img.complete).length;

        imagesLoadedRef.current = completeImages;
        if (completeImages > 0) {
            setLoadedImages(completeImages);
        }
    }, [chapter.id, chapter.images.length]);

    const SENTINEL_COUNT = 50;

    useEffect(() => {
        if (loadedImages !== chapter.images.length || !readerRef.current)
            return;

        const sentinels =
            readerRef.current.querySelectorAll<HTMLElement>("[data-sentinel]");
        const visibility = new Map<number, boolean>();

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const pct = Number(
                        entry.target.getAttribute("data-progress"),
                    );
                    visibility.set(pct, entry.isIntersecting);
                }

                let maxVisible = 0;
                for (const [pct, visible] of visibility) {
                    if (visible && pct > maxVisible) maxVisible = pct;
                }
                setProgress(maxVisible);
            },
            { threshold: 0 },
        );

        sentinels.forEach((s) => observer.observe(s));

        return () => {
            observer.disconnect();
            visibility.clear();
        };
    }, [loadedImages, chapter.images.length, chapter.id]);

    const chapterRef = useRef(chapter);
    chapterRef.current = chapter;
    const imagesLength = chapter.images.length;
    const nextChapter = chapter.nextChapter;
    useEffect(() => {
        if (!chapterRef.current) return;
        const halfWay = progress > 0.5;
        const prefetch = progress > 0.8;
        const currentTime = Date.now();
        const timeElapsed = currentTime - mountTimeRef.current;
        const minSyncTime = 5000;

        if (
            halfWay &&
            !bookmarkUpdatedRef.current &&
            timeElapsed >= minSyncTime
        ) {
            void syncAllServices(chapterRef.current).then((success) => {
                setBookmarkState(success);
                if (success) {
                    void queryClient.invalidateQueries({
                        queryKey: ["bookmarks"],
                    });
                }
            });
            bookmarkUpdatedRef.current = true;
        }

        if (prefetch && nextChapter && !hasPrefetchedRef.current) {
            router.preloadRoute({
                to: `/manga/$mangaId/$scanlator/$subId`,
                params: {
                    mangaId: chapter.mangaId,
                    scanlator: chapter.nextChapter!.scanlatorId.toString(),
                    subId: chapter.nextChapter!.number.toString(),
                },
            });
            hasPrefetchedRef.current = true;
        }
    }, [
        progress,
        imagesLength,
        nextChapter,
        queryClient,
        router,
        setBookmarkState,
    ]);

    return (
        <>
            <ChapterInfo chapter={chapter} hidden={progress === 1} />
            <div>
                <div
                    id="reader"
                    ref={readerRef}
                    className="flex flex-col items-center transition-colors duration-500 relative"
                >
                    {chapter.images.map((img, index) => (
                        <Image
                            key={img}
                            ref={
                                index === chapter.images.length - 1
                                    ? lastImageRef
                                    : null
                            }
                            src={img}
                            alt={`${chapter.title} - ${chapter.title} Page ${index + 1}`}
                            width={720}
                            height={1500}
                            className={cn(
                                "object-contain z-20 relative max-w-full",
                                {
                                    "rounded-t": index === 0,
                                    "rounded-b":
                                        index === chapter.images.length - 1,
                                },
                            )}
                            style={{
                                width: `calc(var(--spacing) * ${stripWidth})`,
                            }}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            onLoad={() => {
                                imagesLoadedRef.current = Math.min(
                                    chapter.images.length,
                                    imagesLoadedRef.current + 1,
                                );
                                setLoadedImages(imagesLoadedRef.current);
                            }}
                            unOptimized
                        />
                    ))}
                    {loadedImages === chapter.images.length &&
                        Array.from({ length: SENTINEL_COUNT + 1 }, (_, i) => (
                            <div
                                key={`sentinel-${i}`}
                                data-sentinel
                                data-progress={i / SENTINEL_COUNT}
                                className="absolute w-px h-px opacity-0 pointer-events-none"
                                style={{
                                    top: `${(i / SENTINEL_COUNT) * 100}%`,
                                }}
                            />
                        ))}
                </div>
                <div>
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
        </>
    );
}
