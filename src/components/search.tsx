"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { client } from "@/lib/api";
import { Genre, genres, MANGA_TYPES } from "@/lib/api/search";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GRID_CLASS } from "./grid-page";
import MangaCardSkeleton from "./manga/manga-card-skeleton";
import { MangaGrid } from "./manga/manga-grid";
import { Filters, SearchFilters } from "./search/filters";
import { Badge } from "./ui/badge";
import ClientPagination from "./ui/pagination/client-pagination";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get("q") || "";
    const page = Number(searchParams.get("p")) || 1;

    // Parse filters from URL
    const genresParam = searchParams.get("genres") || "";
    const typesParam = searchParams.get("types") || "";
    const sortParam = searchParams.get("sort") || "search";

    const selectedGenresFromUrl = genresParam
        ? (genresParam
              .split(",")
              .filter((g) => genres.includes(g as Genre)) as Genre[])
        : [];

    const selectedTypesFromUrl = typesParam
        ? (typesParam
              .split(",")
              .filter((t) =>
                  MANGA_TYPES.includes(t as (typeof MANGA_TYPES)[number]),
              ) as (typeof MANGA_TYPES)[number][])
        : [];

    const [searchQuery, setSearchQuery] = useState(query);
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, {
        wait: 300,
    });
    const [currentPage, setCurrentPage] = useState(page);
    const [filters, setFilters] = useState<SearchFilters>({
        genres: selectedGenresFromUrl,
        types: selectedTypesFromUrl,
        sort: sortParam as SearchFilters["sort"],
    });

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (currentPage > 1) params.set("p", currentPage.toString());
        if (filters.genres.length > 0)
            params.set("genres", filters.genres.join(","));
        if (filters.types.length > 0)
            params.set("types", filters.types.join(","));
        if (filters.sort !== "search") params.set("sort", filters.sort);

        router.replace(`/search?${params.toString()}`);
    }, [searchQuery, currentPage, filters, router]);

    const { data: searchData, isLoading } = useQuery({
        queryKey: ["search", debouncedSearchQuery, currentPage, filters],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/manga/list", {
                params: {
                    query: {
                        query: debouncedSearchQuery,
                        page: currentPage,
                        pageSize: 24,
                        genres: filters.genres,
                        types: filters.types,
                        sortBy: filters.sort,
                    },
                },
            });

            if (error) {
                throw new Error(
                    error.data.message || "Error fetching search results",
                );
            }

            return data.data;
        },
        enabled:
            debouncedSearchQuery.trim().length > 0 ||
            filters.genres.length > 0 ||
            filters.types.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        queueMicrotask(() => {
            setCurrentPage(1);
        });
    }, [searchQuery, filters]);

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
                            {(filters.genres.length > 0 ||
                                filters.types.length > 0) && (
                                <Badge className="px-1">
                                    {filters.genres.length +
                                        filters.types.length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 md:w-128">
                        <Filters filters={filters} onChange={setFilters} />
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
