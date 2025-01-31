"use client";

import { SmallManga } from "@/app/api/interfaces";
import { MangaCard } from "./ui/Home/MangaCard";
import { useEffect, useState } from "react";
import { getBookmarked } from "@/lib/mangaNato";
interface MangaGridProps {
    mangaList: SmallManga[];
}

export function MangaGrid({ mangaList }: MangaGridProps) {
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    useEffect(() => {
        async function checkBookmarks() {
            const bookmarkedManga = await getBookmarked(mangaList);
            setBookmarks(bookmarkedManga);
        }

        checkBookmarks();
    }, [mangaList]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mangaList.map((manga) => (
                <MangaCard
                    key={manga.id}
                    manga={manga}
                    isBookmarked={bookmarks.includes(manga.id)}
                />
            ))}
        </div>
    );
}
