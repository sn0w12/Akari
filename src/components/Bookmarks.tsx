"use client";

import { getProductionUrl } from "@/app/api/baseUrl";
import BookmarksBody from "./ui/Bookmarks/BookmarksBody";
import { useEffect, useState } from "react";
import { Bookmark } from "@/app/api/interfaces";
import BookmarksSkeleton from "@/components/ui/Bookmarks/bookmarksSkeleton";

interface BookmarksPageProps {
    page: number;
}

async function fetchBookmarks(page: number) {
    try {
        const response = await fetch(
            `${getProductionUrl()}/api/bookmarks?page=${page}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                signal: AbortSignal.timeout(10000),
            },
        );

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
            <main className="container mx-auto px-4 pt-6 pb-8">
                <BookmarksBody
                    bookmarks={bookmarks}
                    page={page}
                    totalPages={totalPages}
                    error={error}
                />
            </main>
        </div>
    );
}
