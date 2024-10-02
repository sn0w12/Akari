"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Combo } from "@/components/ui/combo";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import React from "react";
import PaginationElement from "@/components/ui/paginationElement";
import { debounce } from "lodash";
import nextBase64 from "next-base64";

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

interface PageProps {
  params: { id: string };
}

export default function AuthorPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  ); // Initialized from URL
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState<string>(
    searchParams.get("sort") || "latest"
  );

  // Fetch manga list when currentPage changes
  const fetchMangaList = useCallback(
    async (page: number, sort: string) => {
      setIsLoading(true); // Set loading state
      try {
        const response = await fetch(
          `/api/author/${params.id}?orderBy=${sort}&page=${page}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch manga list");
        }
        const data: MangaListResponse = await response.json();

        setMangaList(data.mangaList);
        setTotalPages(data.metaData.totalPages);
        setIsLoading(false);
      } catch (err) {
        setError(`Error fetching manga list. Please try again later: ${err}`);
        setIsLoading(false);
      }
    },
    [params.id]
  );

  const debouncedFetchMangaList = useCallback(debounce(fetchMangaList, 10), [
    fetchMangaList,
  ]);

  useEffect(() => {
    if (currentPage && sortOption) {
      debouncedFetchMangaList(currentPage, sortOption);
    }

    // Cleanup to cancel the debounced function when the component unmounts or dependencies change
    return () => {
      debouncedFetchMangaList.cancel();
    };
  }, [currentPage, sortOption, debouncedFetchMangaList]);

  // Update the URL when the page changes and avoid re-triggering fetch
  const updateUrl = (page: number, sort: string) => {
    const params = new URLSearchParams(window.location.search);

    // Update the 'page' and 'sort' parameters in the URL
    params.set("page", String(page));
    params.set("sort", sort);

    // Push the updated URL
    router.push(`?${params.toString()}`);

    // Update local state to trigger re-render with new values
    setCurrentPage(page);
    setSortOption(sort);
  };

  // Handle sort option change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = event.target.value;
    setSortOption(newSort);

    // Update the URL with the new sort option and keep the current page
    updateUrl(currentPage, newSort);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-4">
          <h2 className={`text-3xl font-bold mb-6`}>
            {nextBase64
              .decode(params.id)
              .replaceAll("_", " ")
              .replaceAll("|", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h2>
          <Combo
            value={sortOption}
            onChange={handleSortChange}
            className="max-w-48"
            options={[
              { value: "latest", label: "Latest" },
              { value: "topview", label: "Most Views" },
            ]}
          />
        </div>
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
                    <img
                      src={manga.image}
                      alt={manga.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 transition-transform duration-300 ease-in-out">
                        <h3 className="font-bold text-sm mb-1 opacity-100 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                          {manga.title}
                        </h3>
                        <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                          {`Author${
                            manga.author.split(",").length > 1 ? "s" : ""
                          }: `}
                          {manga.author
                            .split(",")
                            .map((author) => author.trim())
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
        handlePageChange={(page) => updateUrl(page, sortOption)}
      />
    </div>
  );
}
