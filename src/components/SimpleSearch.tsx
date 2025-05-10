"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { simpleSearch } from "@/lib/search";
import { debounce } from "lodash";
import PaginationElement from "@/components/ui/Pagination/ClientPaginationElement";
import MangaCardSkeleton from "./ui/Home/MangaCardSkeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { MangaGrid } from "./MangaGrid";
import { SmallManga } from "@/app/api/interfaces";

export default function SimpleSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get("q") || "";
    const page = Number(searchParams.get("p")) || 1;

    const [searchQuery, setSearchQuery] = useState(query);
    const [searchResults, setSearchResults] = useState<SmallManga[]>([]);
    const [currentPage, setCurrentPage] = useState(page);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Update URL when parameters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (currentPage > 1) params.set("p", currentPage.toString());

        router.push(`/search?${params.toString()}`);
    }, [searchQuery, currentPage, router]);

    const debouncedSearch = useCallback(() => {
        const performSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setTotalPages(1);
                return;
            }

            setIsLoading(true);
            try {
                const results = await simpleSearch(searchQuery, currentPage);
                setSearchResults(results.mangaList || []);
                setTotalPages(Number(results.totalPages) || 1);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [searchQuery, currentPage]);

    useEffect(() => {
        const handler = debounce(() => {
            debouncedSearch();
        }, 500);

        handler();

        return () => {
            handler.cancel();
        };
    }, [debouncedSearch]);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="container mx-auto px-4 pt-4">
            <Input
                type="search"
                value={searchQuery}
                placeholder="Search manga..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 mb-4"
            />

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-4">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <MangaCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    {searchResults.length > 0 ? (
                        <MangaGrid mangaList={searchResults} />
                    ) : searchQuery ? (
                        <div className="text-center py-8">
                            <p>
                                No results found for &quot;{searchQuery}&quot;
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p>Enter a search term to find manga</p>
                        </div>
                    )}
                </div>
            )}

            {searchResults.length > 0 && (
                <PaginationElement
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={setCurrentPage}
                    className="mt-4"
                />
            )}
        </div>
    );
}
