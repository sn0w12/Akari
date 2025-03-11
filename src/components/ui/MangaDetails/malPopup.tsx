"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSetting } from "@/lib/settings";

interface MalSearchResult {
    id: number;
    name: string;
    image_url: string;
    url: string;
    payload: {
        media_type: string;
        start_year: number;
        published: string;
        score: string;
        status: string;
    };
    es_score: number;
}

interface MalPopupProps {
    mangaTitle: string;
    mangaId: string;
}

export function MalPopup({ mangaTitle, mangaId }: MalPopupProps) {
    const [firstResult, setFirstResult] = useState<MalSearchResult | null>(
        null,
    );
    const [isVisible, setIsVisible] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MalSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [originalSuggestionId, setOriginalSuggestionId] = useState<
        number | null
    >(null);

    useEffect(() => {
        if (isSearchMode && mangaTitle && !searchQuery) {
            setSearchQuery(mangaTitle);
            handleSearch(null);
        }
    }, [isSearchMode, mangaTitle, searchQuery]);

    useEffect(() => {
        const checkVoteStatus = async () => {
            try {
                const response = await fetch(
                    `/api/mal/check-vote?mangaId=${mangaId}`,
                );
                const data = await response.json();

                if (data.hasVoted) {
                    setIsVisible(false);
                    return;
                }

                // Only search MAL if user hasn't voted
                searchMal();
            } catch (error) {
                console.error("Error checking vote status:", error);
            }
        };

        const searchMal = async () => {
            if (!mangaTitle || !mangaId) return;

            try {
                // First try to get data directly using mangaId
                const directResponse = await fetch(
                    `/api/mal/${mangaId}?includeVotes=true`,
                );

                if (directResponse.ok) {
                    const directData = await directResponse.json();

                    if (directData.success && directData.data) {
                        // Create a result object from the direct API data
                        const result: MalSearchResult = {
                            id: directData.data.mal_id,
                            name: mangaTitle,
                            image_url: directData.data.image,
                            url: `https://myanimelist.net/manga/${directData.data.mal_id}`,
                            payload: {
                                media_type: "",
                                start_year: 0,
                                published: "",
                                score: directData.data.score.toString(),
                                status: "",
                            },
                            es_score: 1,
                        };

                        setFirstResult(result);
                        setOriginalSuggestionId(directData.data.mal_id);
                        setIsVisible(
                            directData.data.should_show_popup !== false,
                        );
                        return;
                    }
                }

                // Fall back to search if direct lookup fails
                const response = await fetch(
                    `/api/mal/search?q=${encodeURIComponent(mangaTitle)}&v=1`,
                );
                const data = await response.json();
                const firstItem = data.categories[0]?.items[0] || null;

                const allItems: MalSearchResult[] = [];
                data.categories?.forEach((category: any) => {
                    if (category.items && category.items.length > 0) {
                        allItems.push(...category.items);
                    }
                });

                setSearchResults(allItems);

                if (firstItem) {
                    setFirstResult(firstItem);
                    setOriginalSuggestionId(firstItem.id);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error("Error fetching MAL data:", error);
            }
        };

        const shouldShow = !getSetting("disableMalPopup");
        if (mangaTitle && mangaId && shouldShow) {
            checkVoteStatus();
        }
    }, [mangaTitle, mangaId]);

    async function onSelect(id: number, isPositive: boolean) {
        try {
            const response = await fetch("/api/mal/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mangaId,
                    malId: id,
                    isPositive,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    console.error("You must be logged in to vote");
                    return;
                }
                if (response.status === 400 && data.error === "Already voted") {
                    console.error("You have already voted for this manga");
                    return;
                }
                throw new Error(data.error);
            }

            // Show feedback about remaining votes needed
            const remainingVotes = 3 - (data.votes || 0);
            if (remainingVotes > 0) {
                console.log(
                    `Thanks for voting! ${remainingVotes} more votes needed to confirm this match.`,
                );
            } else {
                console.log("Match confirmed! MAL data has been saved.");
            }
        } catch (error) {
            console.error("Error submitting vote:", error);
        }
    }

    async function handleSearch(e: React.FormEvent | null) {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `/api/mal/search?q=${encodeURIComponent(searchQuery)}&v=1`,
            );
            const data = await response.json();

            // Extract all items from categories
            const allItems: MalSearchResult[] = [];
            data.categories?.forEach((category: any) => {
                if (category.items && category.items.length > 0) {
                    allItems.push(...category.items);
                }
            });

            setSearchResults(allItems);
        } catch (error) {
            console.error("Error searching MAL:", error);
        } finally {
            setIsSearching(false);
        }
    }

    if (!isVisible || !localStorage.getItem("accountName")) return null;

    return (
        <div
            id="mal-popup"
            className="fixed right-0 sm:right-4 top-4 z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg"
        >
            <button
                onClick={() => {
                    // When closing the popup in search mode, send a negative vote for the original suggestion
                    if (isSearchMode && originalSuggestionId !== null) {
                        onSelect(originalSuggestionId, false);
                    }
                    setIsVisible(false);
                }}
                className="absolute right-4 top-4 p-1 hover:bg-accent rounded-full"
                aria-label="Close popup"
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                >
                    <path
                        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <div className="flex flex-col space-y-4">
                {isSearchMode ? (
                    <>
                        <h3 className="text-lg font-semibold">
                            Find the correct manga
                        </h3>
                        <form
                            onSubmit={(e) => handleSearch(e)}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for manga..."
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="max-h-80 overflow-auto">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                                        onClick={() => {
                                            // If user selects a different result, send a negative vote for the original
                                            if (
                                                originalSuggestionId !== null &&
                                                originalSuggestionId !==
                                                    result.id
                                            ) {
                                                onSelect(
                                                    originalSuggestionId,
                                                    false,
                                                );
                                            }
                                            onSelect(result.id, true);
                                            setIsVisible(false);
                                        }}
                                    >
                                        <Image
                                            src={result.image_url}
                                            alt={result.name}
                                            className="w-10 h-auto object-cover rounded"
                                            width={40}
                                            height={60}
                                        />
                                        <div>
                                            <p className="font-medium">
                                                {result.name}
                                            </p>
                                            {result.payload?.score && (
                                                <p className="text-xs text-muted-foreground">
                                                    Score:{" "}
                                                    {result.payload.score}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end mt-2">
                            <button
                                onClick={() => {
                                    // User explicitly confirms none of the results match
                                    if (originalSuggestionId !== null) {
                                        onSelect(originalSuggestionId, false);
                                    }
                                    setIsVisible(false);
                                }}
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                None of these match
                            </button>
                        </div>
                    </>
                ) : firstResult ? (
                    <>
                        <div className="flex items-center gap-4">
                            <Image
                                src={firstResult.image_url}
                                alt={firstResult.name}
                                className="w-16 h-auto object-cover rounded"
                                width={64}
                                height={64}
                            />
                            <div className="space-y-1.5">
                                <Link
                                    href={`https://myanimelist.net/manga/${firstResult.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-semibold leading-none tracking-tight hover:underline"
                                >
                                    {firstResult.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    Is this the correct manga?
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsSearchMode(true);
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    onSelect(firstResult.id, true);
                                    setIsVisible(false);
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                            >
                                Yes
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
