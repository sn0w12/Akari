"use client";

import { Chapter } from "@/app/api/interfaces";
import Image from "next/image";
import MangaFooter from "../mangaFooter";
import { useEffect, useRef, useState } from "react";
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
    const [timeElapsed, setTimeElapsed] = useState(0);
    const bookmarkUpdatedRef = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!chapter || bookmarkUpdatedRef.current) return;
        const thirtySecondsPassed = timeElapsed >= 30;

        if (thirtySecondsPassed) {
            syncAllServices(chapter);
            bookmarkUpdatedRef.current = true;
        }
    }, [chapter]);

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
