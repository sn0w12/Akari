"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import React from "react";
import PaginationElement from "@/components/ui/paginationElement";
import { debounce } from "lodash";
import Image from "next/image";

interface Manga {
    id: string;
    image: string;
    title: string;
    chapter: string;
    chapterUrl: string;
    description: string;
    rating: string;
    views: string;
    date: string;
    author: string;
}

interface MangaListResponse {
    mangaList: Manga[];
    popular: Manga[];
    metaData: {
        totalStories: number;
        totalPages: number;
    };
}

export default function MangaReaderHome() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [popularList, setPopularList] = useState<Manga[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(
        Number(searchParams.get("page")) || 1,
    ); // Initialized from URL
    const [totalPages, setTotalPages] = useState(1);

    // Pagination state for "Popular Releases"
    const [currentPopularPage, setCurrentPopularPage] = useState(1);
    const itemsPerPage = 12;
    const totalPopularPages = Math.ceil(popularList.length / itemsPerPage);

    // Fetch manga list when currentPage changes
    const fetchMangaList = useCallback(async (page: number) => {
        setIsLoading(true); // Set loading state
        try {
            const response = await fetch(`/api/manga-list/latest?page=${page}`);
            if (!response.ok) {
                throw new Error("Failed to fetch manga list");
            }
            const data: MangaListResponse = await response.json();
            setMangaList(data.mangaList);
            setPopularList(data.popular);
            setTotalPages(data.metaData.totalPages);
            setIsLoading(false);
        } catch (err) {
            setError(
                `Error fetching manga list. Please try again later: ${err}`,
            );
            setIsLoading(false);
        }
    }, []);

    const debouncedFetchMangaList = useCallback(debounce(fetchMangaList, 10), [
        fetchMangaList,
    ]);

    useEffect(() => {
        if (currentPage) {
            debouncedFetchMangaList(currentPage);
        }

        // Cleanup to cancel the debounced function when the component unmounts or currentPage changes
        return () => {
            debouncedFetchMangaList.cancel();
        };
    }, [currentPage, debouncedFetchMangaList]);

    // Update the URL when the page changes and avoid re-triggering fetch
    const updateUrl = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
            router.push(`?page=${page}`);
        }
    };

    // Handle local pagination for "Popular Releases"
    const handlePopularPreviousPage = () => {
        if (currentPopularPage > 1) {
            setCurrentPopularPage(currentPopularPage - 1);
        }
    };

    const handlePopularNextPage = () => {
        if (currentPopularPage < totalPopularPages) {
            setCurrentPopularPage(currentPopularPage + 1);
        }
    };

    const paginatedPopularList = popularList.slice(
        (currentPopularPage - 1) * itemsPerPage,
        currentPopularPage * itemsPerPage,
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div style={{ display: currentPage === 1 ? "" : "None" }}>
                    <h2 className="text-3xl font-bold mb-6">Popular Manga</h2>
                    {isLoading && <CenteredSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {paginatedPopularList.map((manga) => (
                                    <Link
                                        href={`/manga/${manga.id}`}
                                        key={manga.id}
                                        className="block"
                                    >
                                        <Card className="group relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
                                            <CardContent className="p-0">
                                                <Image
                                                    src={manga.image}
                                                    alt={manga.title}
                                                    width={250}
                                                    height={350}
                                                    className="w-full h-auto object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 transition-transform duration-300 ease-in-out">
                                                        <h3 className="font-bold text-sm mb-1 opacity-100 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                            {manga.title}
                                                        </h3>
                                                        <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                            Chapter:{" "}
                                                            {manga.chapter}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination Controls for Popular Releases */}
                            <div className="flex justify-between items-center mt-6 px-4 py-4 border-t border-b">
                                <Button
                                    variant="outline"
                                    onClick={handlePopularPreviousPage}
                                    disabled={currentPopularPage === 1}
                                >
                                    Previous
                                </Button>
                                <span>
                                    Page {currentPopularPage} of{" "}
                                    {totalPopularPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={handlePopularNextPage}
                                    disabled={
                                        currentPopularPage === totalPopularPages
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <h2
                    className={`text-3xl font-bold mb-6 ${
                        currentPage === 1 ? "mt-6" : ""
                    }`}
                >
                    Latest Releases
                </h2>
                {isLoading && <CenteredSpinner />}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {mangaList.map((manga) => (
                            <Link
                                href={`/manga/${manga.id}`}
                                key={manga.id}
                                className="block"
                            >
                                <Card className="group relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
                                    <CardContent className="p-0">
                                        <Image
                                            src={manga.image}
                                            alt={manga.title}
                                            width={250}
                                            height={350}
                                            className="w-full h-auto object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 transition-transform duration-300 ease-in-out">
                                                <h3 className="font-bold text-sm mb-1 opacity-100 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                    {manga.title}
                                                </h3>
                                                <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                    {`Author${
                                                        manga.author.split(",")
                                                            .length > 1
                                                            ? "s"
                                                            : ""
                                                    }: `}
                                                    {manga.author
                                                        .split(",")
                                                        .map((author) =>
                                                            author.trim(),
                                                        )
                                                        .join(" | ")}
                                                </p>
                                                <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                    Chapter: {manga.chapter}
                                                </p>
                                                <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                    Views: {manga.views}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer for pagination */}
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={updateUrl}
            />
        </div>
    );
}
