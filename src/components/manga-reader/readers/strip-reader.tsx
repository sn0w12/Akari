"use client";

import Image from "next/image";
import MangaFooter from "../manga-footer";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { syncAllServices } from "@/lib/manga/sync";
import { useQueryClient } from "@tanstack/react-query";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface StripReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    scrollMetrics: { pixels: number; percentage: number };
    toggleReaderMode: () => void;
    bgColor: string;
    setBookmarkState: (state: boolean | null) => void;
}

export default function StripReader({
    chapter,
    scrollMetrics,
    toggleReaderMode,
    bgColor,
    setBookmarkState,
}: StripReaderProps) {
    const router = useRouter();
    const stripWidth = useSetting("stripWidth");
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);
    const mountTimeRef = useRef<number>(0);
    const queryClient = useQueryClient();

    useEffect(() => {
        mountTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (!chapter) return;
        const halfWay = scrollMetrics.percentage > 50;
        const prefetch = scrollMetrics.percentage > 80;
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
    }, [
        scrollMetrics.percentage,
        chapter,
        router,
        setBookmarkState,
        queryClient,
    ]);

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
                        unoptimized={true}
                    />
                ))}
            </div>
            <MangaFooter
                chapter={chapter}
                toggleReaderMode={toggleReaderMode}
            />
        </div>
    );
}
