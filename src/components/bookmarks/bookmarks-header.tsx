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
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/components/ui/puff-loader";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { BookmarksDropdown } from "./bookmarks-dropdown";

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
        queueMicrotask(() => {
            setSelectedIndex(-1);
        });
    }, [debouncedSearchQuery]);

    const getBookmarkSearchResults = async (
        query: string
    ): Promise<components["schemas"]["BookmarkListResponse"]["items"]> => {
        const { data, error } = await client.GET("/v2/bookmarks/search", {
            params: {
                query: {
                    query,
                },
            },
        });

        if (error || !data) {
            return [];
        }

        return data.data.items;
    };

    const { data: searchResults = [], isLoading: isSearchLoading } = useQuery({
        queryKey: ["bookmarks-search", debouncedSearchQuery],
        queryFn: () => getBookmarkSearchResults(debouncedSearchQuery),
        enabled: debouncedSearchQuery.trim().length > 0,
        staleTime: 5 * 60 * 1000,
    });

    async function exportBookmarks() {
        const allBookmarks: components["schemas"]["BookmarkListResponse"]["items"] =
            [];
        let currentPage = 1;
        let totalPages = 1;
        const pageSize = 100;

        while (currentPage <= totalPages) {
            const { data, error } = await client.GET("/v2/bookmarks", {
                params: {
                    query: {
                        page: currentPage,
                        pageSize,
                    },
                },
            });

            if (error || !data) {
                new Toast("Error fetching bookmarks", "error");
                return;
            }

            allBookmarks.push(...data.data.items);
            totalPages = data.data.totalPages;
            currentPage++;
        }

        const bookmarksBlob = new Blob(
            [JSON.stringify(allBookmarks, null, 2)],
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (searchResults.length === 0) return;
        if (searchResults[selectedIndex] === undefined) return;

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
        <div className="relative mb-4">
            <div className="flex flex-row gap-2 md:gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className={
                        "hidden md:flex w-auto md:h-auto items-center justify-center"
                    }
                    onClick={exportBookmarks}
                >
                    Export Bookmarks
                </Button>
                <div className="relative w-full h-10 md:h-9">
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
                        className="no-cancel text-sm h-full"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <BookmarksDropdown
                    exportBookmarks={exportBookmarks}
                />
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
                                                src={result.cover}
                                                alt={result.title}
                                                width={300}
                                                height={450}
                                                className="max-h-24 w-auto rounded mr-2"
                                            />
                                            {result.title}
                                        </div>
                                        <Link
                                            href={`/manga/${result.mangaId}/${result.lastReadChapter.number}`}
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
