"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getSearchResults } from "@/lib/api/search";
import ClientPagination from "./ui/pagination/client-pagination";
import MangaCardSkeleton from "./manga/manga-card-skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { MangaGrid } from "./manga/manga-grid";
import { useQuery } from "@tanstack/react-query";

export default function SimpleSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get("q") || "";
    const page = Number(searchParams.get("p")) || 1;

    const [searchQuery, setSearchQuery] = useState(query);
    const [currentPage, setCurrentPage] = useState(page);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (currentPage > 1) params.set("p", currentPage.toString());

        router.push(`/search?${params.toString()}`);
    }, [searchQuery, currentPage, router]);

    const { data: searchData, isLoading } = useQuery({
        queryKey: ["search", debouncedSearchQuery, currentPage],
        queryFn: () => getSearchResults(debouncedSearchQuery, currentPage, 100),
        enabled: debouncedSearchQuery.trim().length > 0,
        staleTime: 5 * 60 * 1000,
    });

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
                    {searchData?.mangaList &&
                    searchData.mangaList.length > 0 ? (
                        <MangaGrid mangaList={searchData.mangaList} />
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

            {searchData?.mangaList && searchData.mangaList.length > 0 && (
                <ClientPagination
                    currentPage={currentPage}
                    totalPages={searchData.totalPages}
                    handlePageChange={setCurrentPage}
                    className="my-4"
                />
            )}
        </div>
    );
}
