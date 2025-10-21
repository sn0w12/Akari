"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Toast from "@/lib/toast-wrapper";
import { imageUrl } from "@/lib/utils";
import { SmallBookmark, SmallBookmarkRecord } from "@/types/manga";
import { fetchApi, isApiErrorResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/components/ui/puff-loader";
import { useConfirm } from "@/contexts/confirm-context";
import { SyncStatus } from "@/types/api";

export default function BookmarksHeader() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isHoveringSearchButton, setIsHoveringSearchButton] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const router = useRouter();
    const { confirm } = useConfirm();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setSelectedIndex(-1);
    }, [debouncedSearchQuery]);

    const getBookmarkSearchResults = async (
        query: string
    ): Promise<SmallBookmark[]> => {
        const response = await fetchApi<SmallBookmark[]>(
            `/api/v1/bookmarks/search?q=${encodeURIComponent(query)}`
        );
        if (isApiErrorResponse(response)) {
            throw new Error(response.data.message);
        }
        return response.data;
    };

    const { data: searchResults = [], isLoading: isSearchLoading } = useQuery({
        queryKey: ["bookmarks-search", debouncedSearchQuery],
        queryFn: () => getBookmarkSearchResults(debouncedSearchQuery),
        enabled: debouncedSearchQuery.trim().length > 0,
        staleTime: 5 * 60 * 1000,
    });

    async function exportBookmarks() {
        const allBookmarksResponse = await fetchApi<SmallBookmarkRecord[]>(
            "/api/v1/bookmarks/all"
        );
        if (isApiErrorResponse(allBookmarksResponse)) {
            new Toast(allBookmarksResponse.data.message, "error");
            return;
        }

        const bookmarksBlob = new Blob(
            [JSON.stringify(allBookmarksResponse.data, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(bookmarksBlob);
        const a = Object.assign(document.createElement("a"), {
            href: url,
            download: "bookmarks.json",
        });

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function syncToMal() {
        const confirmed = await confirm({
            title: "Sync bookmarks to MyAnimeList",
            description:
                "Your sync request will be queued and processed shortly. You will not be able to make another sync request until the current one is completed.",
            confirmText: "Yes, Sync",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        const response = await fetchApi<SyncStatus>("/api/v1/mal/sync", {
            method: "POST",
        });
        if (isApiErrorResponse(response)) {
            new Toast(response.data.message, "error");
            return;
        }
        new Toast(
            `Sync request queued at position: ${response.data.position}`,
            "success"
        );
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (searchResults.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                Math.min(prev + 1, searchResults.length - 1)
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            e.preventDefault();
            router.push(`/manga/${searchResults[selectedIndex].mangaId}`);
        }
    };

    return (
        <div className="relative mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className={
                        "w-auto md:h-auto flex items-center justify-center"
                    }
                    onClick={exportBookmarks}
                >
                    Export Bookmarks
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className={
                        "w-auto md:h-auto flex items-center justify-center bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 text-white"
                    }
                    onClick={syncToMal}
                >
                    Sync to MAL
                </Button>
                <div className="relative w-full">
                    <Input
                        type="search"
                        placeholder="Search bookmarks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() =>
                            setTimeout(() => setIsFocused(false), 150)
                        }
                        onKeyDown={handleKeyDown}
                        className="no-cancel text-sm"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
            </div>
            {isFocused && searchResults.length > 0 && (
                <Card className="absolute z-10 w-full mt-1 p-0">
                    <CardContent
                        className="p-2 max-h-[60vh] overflow-y-scroll"
                        data-scrollbar-custom
                    >
                        {isSearchLoading ? (
                            <div className="flex justify-center">
                                <Spinner />
                            </div>
                        ) : (
                            searchResults.map((result, index) => (
                                <Link
                                    href={`/manga/${result.mangaId}`}
                                    key={result.mangaId}
                                    className={`block p-2 ${
                                        index === selectedIndex
                                            ? "bg-accent"
                                            : isHoveringSearchButton
                                            ? ""
                                            : "hover:bg-accent"
                                    } flex items-center rounded-lg`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <Image
                                                src={imageUrl(
                                                    result.mangaImage ||
                                                        `https://img-r1.2xstorage.com/thumb/${result.mangaId}.webp`
                                                )}
                                                alt={result.mangaName}
                                                width={300}
                                                height={450}
                                                className="max-h-24 w-auto rounded mr-2"
                                            />
                                            {result.mangaName}
                                        </div>
                                        <Link
                                            href={`/manga/${result.mangaId}/${result.latestChapter}`}
                                        >
                                            <Button
                                                className="z-20"
                                                onMouseEnter={() => {
                                                    setIsHoveringSearchButton(
                                                        true
                                                    );
                                                }}
                                                onMouseLeave={() => {
                                                    setIsHoveringSearchButton(
                                                        false
                                                    );
                                                }}
                                            >
                                                Continue Reading
                                            </Button>
                                        </Link>
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
