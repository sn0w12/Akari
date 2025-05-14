"use client";

import BookmarksBody from "./ui/Bookmarks/BookmarksBody";
import { useEffect, useState } from "react";
import { Bookmark } from "@/app/api/interfaces";
import BookmarksSkeleton from "@/components/ui/Bookmarks/bookmarksSkeleton";
import { generateFetchCacheOptions } from "@/lib/cache";

interface BookmarksPageProps {
    page: number;
}

export async function fetchBookmarks(page: number) {
    try {
        const response = await fetch(
            `/api/bookmarks?page=${page}&images=true`,
            generateFetchCacheOptions(60),
        );

        if (response.redirected) {
            window.location.href = response.url;
            return;
        }

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Could not parse JSON:", jsonError);
            return {
                bookmarks: [],
                error: "Invalid JSON response",
                totalPages: 1,
            };
        }

        if (data.message) {
            return {
                bookmarks: [],
                error: data.message,
                totalPages: 1,
            };
        }

        return data;
    } catch (err) {
        console.error("Error fetching bookmarks:", err);
        return {
            bookmarks: [],
            totalPages: 1,
        };
    }
}

export default function BookmarksPage({ page }: BookmarksPageProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadBookmarks = async () => {
            setIsLoading(true);
            const data = await fetchBookmarks(page);
            setBookmarks(data?.bookmarks || []);
            setTotalPages(data?.totalPages || 1);
            setError(data?.error || "");
            setIsLoading(false);
        };

        loadBookmarks();
    }, [page]);

    if (isLoading) {
        return <BookmarksSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto p-4">
                <BookmarksBody
                    bookmarks={bookmarks}
                    page={page}
                    totalPages={totalPages}
                    error={error}
                />
            </div>
        </div>
    );
}
