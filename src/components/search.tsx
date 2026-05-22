import { Input } from "@/components/ui/input";
import { client } from "@/lib/api";
import { Genre, genres, MANGA_TYPES } from "@/lib/api/search";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GRID_CLASS } from "./grid-page";
import MangaCardSkeleton from "./manga/manga-card-skeleton";
import { MangaGrid } from "./manga/manga-grid";
import { Filters, SearchFilters } from "./search/filters";
import ClientPagination from "./ui/pagination/client-pagination";

export default function SearchPage() {
    const search = useRouterState({ select: (s) => s.location.search });
    const router = useRouter();

    const query = search.query || "";
    const page = parseInt(String(search.page || "1"), 10);

    // Parse filters from URL
    const genresParam = search.genres || "";
    const typesParam = search.types || "";
    const excludedGenresParam = search.excludedGenres || "";
    const excludedTypesParam = search.excludedTypes || "";
    const sortParam = search.sort || "search";

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

    const excludedGenresFromUrl = excludedGenresParam
        ? (excludedGenresParam
              .split(",")
              .filter((g) => genres.includes(g as Genre)) as Genre[])
        : [];

    const excludedTypesFromUrl = excludedTypesParam
        ? (excludedTypesParam
              .split(",")
              .filter((t) =>
                  MANGA_TYPES.includes(t as (typeof MANGA_TYPES)[number]),
              ) as (typeof MANGA_TYPES)[number][])
        : [];

    const [searchQuery, setSearchQuery] = useState(query); // useState initializer — local state owner after mount
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, {
        wait: 300,
    });
    const [currentPage, setCurrentPage] = useState(page); // useState initializer — local state owner after mount
    const [filters, setFilters] = useState<SearchFilters>({ // useState initializer — local state owner after mount
        genres: selectedGenresFromUrl,
        excludedGenres: excludedGenresFromUrl,
        types: selectedTypesFromUrl,
        excludedTypes: excludedTypesFromUrl,
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
        if (filters.excludedGenres.length > 0)
            params.set("excludedGenres", filters.excludedGenres.join(","));
        if (filters.excludedTypes.length > 0)
            params.set("excludedTypes", filters.excludedTypes.join(","));
        if (filters.sort !== "search") params.set("sort", filters.sort);

        window.history.replaceState(null, "", `/search?${params.toString()}`);
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
                        excludedGenres: filters.excludedGenres,
                        excludedTypes: filters.excludedTypes,
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
            filters.types.length > 0 ||
            filters.excludedGenres.length > 0 ||
            filters.excludedTypes.length > 0,
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
                    className="flex-1"
                />
                <Filters filters={filters} onChange={setFilters} />
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
