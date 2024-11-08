"use client";

import { Manga } from "@/app/api/interfaces";
import BookmarkButton from "./bookmarkButton";
import ReadingButton from "./readingButton";
import { useState, useCallback, useEffect } from "react";
import React from "react";
import db from "@/lib/db";
import { debounce } from "lodash";
import { checkIfBookmarked } from "@/lib/bookmarks";
import { Skeleton } from "../skeleton";

interface ButtonsProps {
    manga: Manga;
}

export default function Buttons({ manga }: ButtonsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [bmData, setBmData] = useState("");
    const [lastRead, setLastRead] = useState<string>("");
    const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
    const id = manga.identifier;

    const loadManga = useCallback(async () => {
        setIsLoading(true);
        const [cachedData, isBookmarked] = await Promise.all([
            db.getCache(db.mangaCache, id),
            checkIfBookmarked(manga.mangaId),
        ]);

        setIsBookmarked(isBookmarked);
        if (cachedData) {
            setBmData(cachedData.bm_data);
            setLastRead(cachedData.last_read);
        } else {
            db.updateCache(db.mangaCache, id, { id: manga.mangaId });
        }
        setIsLoading(false);
    }, [id]);

    const debouncedLoadManga = useCallback(debounce(loadManga, 10), [
        loadManga,
    ]);

    useEffect(() => {
        debouncedLoadManga();

        // Cleanup debounce on unmount
        return () => {
            debouncedLoadManga.cancel();
        };
    }, [debouncedLoadManga, manga]);

    if (isLoading) {
        return (
            <div className="flex flex-col xl:flex-row gap-4 mt-auto">
                <Skeleton className="h-11 w-full xl:w-1/2" />
                <Skeleton className="h-11 w-full xl:w-1/2" />
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row gap-4 mt-auto">
            {/* Toggle bookmark button based on bookmark status */}
            <BookmarkButton
                manga={manga}
                isBookmarked={isBookmarked}
                bmData={bmData}
            />
            <ReadingButton manga={manga} lastRead={lastRead} />
        </div>
    );
}