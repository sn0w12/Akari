"use client";

import { Chapter } from "@/app/api/interfaces";
import Image from "next/image";
import MangaFooter from "../mangaFooter";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncAllServices } from "@/lib/sync";

interface StripReaderProps {
    chapter: Chapter;
    handleImageLoad: (
        e: React.SyntheticEvent<HTMLImageElement>,
        index: number,
    ) => void;
    toggleReaderMode: () => void;
}

export default function StripReader({
    chapter,
    handleImageLoad,
    toggleReaderMode,
}: StripReaderProps) {
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const bookmarkUpdatedRef = useRef(false);
    const router = useRouter();
    const hasPrefetchedRef = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            const element = document.documentElement;
            const scrollTop = element.scrollTop || document.body.scrollTop;
            const scrollHeight =
                element.scrollHeight || document.body.scrollHeight;
            const clientHeight = element.clientHeight;
            const percentage =
                (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollPercentage(Math.min(100, Math.max(0, percentage)));
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initial calculation

        return () => {
            window.removeEventListener("scroll", handleScroll);
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
                        loading="eager"
                        priority={index < 3}
                        onLoad={(e) => handleImageLoad(e, index)}
                    />
                ))}
            </div>
            <MangaFooter
                chapterData={chapter}
                toggleReaderMode={toggleReaderMode}
            />
        </div>
    );
}
