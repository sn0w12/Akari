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
    scrollMetrics: {
        pixels: number;
        percentage: number;
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

    const pixels = scrollMetrics.pixels;
    const clientHeight = scrollMetrics.clientHeight;
    useEffect(() => {
        if (
            !lastImageRef.current ||
            !readerRef.current ||
            imagesLoadedRef.current !== chapter.images.length
        )
            return;
        const firstImage = readerRef.current.querySelector(
            "img",
        ) as HTMLImageElement;
        if (!firstImage) return;
        const firstImageTop = firstImage.offsetTop;
        const lastImage = lastImageRef.current;
        const lastImageBottom = lastImage.offsetTop + lastImage.offsetHeight;
        const totalHeight = lastImageBottom - clientHeight - firstImageTop;
        const currentPosition = pixels - firstImageTop;
        const newProgress = Math.max(
            0,
            Math.min(1, currentPosition / totalHeight),
        );

        setProgress(newProgress);
    }, [pixels, clientHeight, loadedImages, chapter.images.length]);

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
                    className={`flex flex-col items-center transition-colors duration-500`}
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
