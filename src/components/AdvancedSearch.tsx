"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { genreMap, GENRE_CATEGORIES, advancedSearch } from "@/lib/search";
import { debounce } from "lodash";
import PaginationElement from "@/components/ui/Pagination/ClientPaginationElement";
import MangaCardSkeleton from "./ui/Home/MangaCardSkeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { MangaGrid } from "./MangaGrid";

type GenreStatus = "neutral" | "included" | "excluded";

interface Genre {
    id: string;
    name: string;
    status: GenreStatus;
}

export default function AdvancedSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get("q") || "";
    const includedGenres =
        searchParams.get("i")?.split(",").filter(Boolean) || [];
    const excludedGenres =
        searchParams.get("e")?.split(",").filter(Boolean) || [];
    const page = Number(searchParams.get("p")) || 1;

    const [searchQuery, setSearchQuery] = useState(query);
    const [searchResults, setSearchResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(page);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(Object.keys(GENRE_CATEGORIES)),
    );
    const [genres, setGenres] = useState<Genre[]>(
        Object.entries(genreMap).map(([name, id]) => {
            const genreId = id.toString();
            let status: GenreStatus = "neutral";

            if (includedGenres.includes(genreId)) {
                status = "included";
            } else if (excludedGenres.includes(genreId)) {
                status = "excluded";
            }

            return {
                id: genreId,
                name,
                status,
            };
        }),
    );

    // Update URL when parameters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);

        const included = genres
            .filter((g) => g.status === "included")
            .map((g) => g.id);
        const excluded = genres
            .filter((g) => g.status === "excluded")
            .map((g) => g.id);

        if (included.length) params.set("i", included.join(","));
        if (excluded.length) params.set("e", excluded.join(","));
        if (currentPage > 1) params.set("p", currentPage.toString());

        router.push(`/search?${params.toString()}`);
    }, [searchQuery, genres, currentPage, router]);

    const toggleCategory = (category: string, event: React.MouseEvent) => {
        if (event.shiftKey) {
            // If category is expanded, collapse all. If collapsed, expand all
            const shouldExpand = !expandedCategories.has(category);
            if (shouldExpand) {
                setExpandedCategories(new Set(Object.keys(GENRE_CATEGORIES)));
            } else {
                setExpandedCategories(new Set());
            }
        } else {
            setExpandedCategories((prev) => {
                const next = new Set(prev);
                if (next.has(category)) {
                    next.delete(category);
                } else {
                    next.add(category);
                }
                return next;
            });
        }
    };

    const cycleGenreStatus = (genreId: string) => {
        setGenres(
            genres.map((genre) => {
                if (genre.id === genreId) {
                    const nextStatus: Record<GenreStatus, GenreStatus> = {
                        neutral: "included",
                        included: "excluded",
                        excluded: "neutral",
                    };
                    return { ...genre, status: nextStatus[genre.status] };
                }
                return genre;
            }),
        );
    };

    const getGenreStyle = (status: GenreStatus) => {
        switch (status) {
            case "included":
                return "bg-green-700 hover:bg-green-800";
            case "excluded":
                return "bg-red-700 hover:bg-red-800";
            default:
                return "bg-background hover:bg-foreground/20";
        }
    };

    const debouncedSearch = useCallback(() => {
        const performSearch = async () => {
            setIsLoading(true);
            const included = genres
                .filter((g) => g.status === "included")
                .map((g) => g.id);
            const excluded = genres
                .filter((g) => g.status === "excluded")
                .map((g) => g.id);

            const results = await advancedSearch(
                searchQuery,
                included,
                excluded,
                currentPage,
            );
            setSearchResults(results.mangaList);
            setTotalPages(Number(results.metaData.totalPages));
            setIsLoading(false);
        };

        performSearch();
    }, [searchQuery, genres, currentPage]);

    useEffect(() => {
        const handler = debounce(() => {
            debouncedSearch();
        }, 500);

        handler();

        return () => {
            handler.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        const performSearch = async () => {
            setIsLoading(true);
            const included = genres
                .filter((g) => g.status === "included")
                .map((g) => g.id);
            const excluded = genres
                .filter((g) => g.status === "excluded")
                .map((g) => g.id);

            const results = await advancedSearch(
                searchQuery,
                included,
                excluded,
                currentPage,
            );
            setSearchResults(results.mangaList);
            setTotalPages(Number(results.metaData.totalPages));
            setIsLoading(false);
        };

        performSearch();
    }, [currentPage, genres, searchQuery]);

    return (
        <div className="container mx-auto px-4 pt-4">
            <Input
                type="search"
                value={searchQuery}
                placeholder="Search manga..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 mb-4"
            />

            <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(GENRE_CATEGORIES).map(
                        ([category, genreList]) => (
                            <div
                                key={category}
                                className="border rounded-lg p-3"
                            >
                                <div
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                    onClick={(e) => toggleCategory(category, e)}
                                >
                                    <h3 className="text-lg font-semibold text-foreground/80">
                                        {category}
                                    </h3>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            expandedCategories.has(category)
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>

                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                        expandedCategories.has(category)
                                            ? "max-g-64 opacity-100 mt-2"
                                            : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className="flex flex-wrap gap-1.5">
                                        {genres
                                            .filter((g) =>
                                                genreList.includes(g.name),
                                            )
                                            .map((genre) => (
                                                <button
                                                    key={genre.id}
                                                    onClick={() =>
                                                        cycleGenreStatus(
                                                            genre.id,
                                                        )
                                                    }
                                                    className={`px-2 py-0.5 text-sm rounded-md border ${getGenreStyle(genre.status)}`}
                                                >
                                                    {genre.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-4">
                    {[...Array(24)].map((_, i) => (
                        <MangaCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    <MangaGrid mangaList={searchResults} />
                </div>
            )}
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={setCurrentPage}
                className="mt-4"
            />
        </div>
    );
}
