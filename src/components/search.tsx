"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import ClientPagination from "./ui/pagination/client-pagination";
import MangaCardSkeleton from "./manga/manga-card-skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { MangaGrid } from "./manga/manga-grid";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";
import GenrePicker from "./search/genre-picker";
import { Genre, genres } from "@/lib/api/search";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { GRID_CLASS } from "./grid-page";
import { useDebouncedValue } from "@tanstack/react-pacer";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get("q") || "";
    const page = Number(searchParams.get("p")) || 1;
    const genresParam = searchParams.get("genres") || "";
    const selectedGenresFromUrl = genresParam
        ? (genresParam
              .split(",")
              .filter((g) => genres.includes(g as Genre)) as Genre[])
        : [];

    const [searchQuery, setSearchQuery] = useState(query);
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, {
        wait: 300,
    });
    const [currentPage, setCurrentPage] = useState(page);
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>(
        selectedGenresFromUrl
    );

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (currentPage > 1) params.set("p", currentPage.toString());
        if (selectedGenres.length > 0)
            params.set("genres", selectedGenres.join(","));

        router.replace(`/search?${params.toString()}`);
    }, [searchQuery, currentPage, selectedGenres, router]);

    const { data: searchData, isLoading } = useQuery({
        queryKey: ["search", debouncedSearchQuery, currentPage, selectedGenres],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/manga/list", {
                params: {
                    query: {
                        query: debouncedSearchQuery,
                        page: currentPage,
                        pageSize: 24,
                        genres: selectedGenres,
                    },
                },
            });

            if (error) {
                throw new Error(
                    error.data.message || "Error fetching search results"
                );
            }

            return data.data;
        },
        enabled:
            debouncedSearchQuery.trim().length > 0 || selectedGenres.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        queueMicrotask(() => {
            setCurrentPage(1);
        });
    }, [searchQuery]);

    useEffect(() => {
        queueMicrotask(() => {
            setCurrentPage(1);
        });
    }, [selectedGenres]);

    return (
        <div className="px-4 pt-4">
            <div className="flex gap-2 mb-4">
                <Input
                    type="search"
                    value={searchQuery}
                    placeholder="Search manga..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 p-2"
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                            {selectedGenres.length > 0 && (
                                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                                    {selectedGenres.length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 md:w-128">
                        <GenrePicker
                            selectedGenres={selectedGenres}
                            onChange={setSelectedGenres}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {isLoading ? (
                <div className={`${GRID_CLASS} mt-4`}>
                    {Array.from({ length: 24 }).map((_, i) => (
                        <MangaCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    {searchData && searchData.items.length > 0 ? (
                        <MangaGrid mangaList={searchData.items} />
                    ) : searchQuery ? (
                        <div className="text-center py-8">
                            <p>
                                No results found for &quot;{searchQuery}&quot;
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p>
                                Enter a search term or select a genre to find
                                manga
                            </p>
                        </div>
                    )}
                </div>
            )}

            {searchData && searchData.items.length > 0 && (
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
