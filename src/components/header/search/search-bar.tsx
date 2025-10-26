"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { getSearchResults } from "@/lib/api/search";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/components/ui/puff-loader";

export default function SearchBar() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const shouldCloseRef = useRef(true);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search text
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchText]);

    // Update showPopup based on focus and search text
    useEffect(() => {
        setShowPopup(isFocused && debouncedSearchText.trim().length > 0);
    }, [isFocused, debouncedSearchText]);

    // Fetch search results using React Query
    const { data: searchResults = [], isLoading: isSearchLoading } = useQuery({
        queryKey: ["search", debouncedSearchText],
        queryFn: () => getSearchResults(debouncedSearchText),
        enabled: debouncedSearchText.trim().length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleSearchInputChange = (e: { target: { value: string } }) => {
        const query = e.target.value;
        setSearchText(query);
    };

    const handleInputBlur = () => {
        shouldCloseRef.current = true;
        setTimeout(() => {
            if (shouldCloseRef.current) {
                setIsFocused(false);
                setShowPopup(false);
            }
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
                // Navigate to the selected result
                router.push(`/manga/${searchResults[focusedIndex]!.id}`);
            } else {
                // Navigate to search page if no result selected
                router.push(`/search?q=${encodeURIComponent(searchText)}`);
            }
            setShowPopup(false);
            inputRef.current?.blur();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Escape") {
            setShowPopup(false);
            setFocusedIndex(-1);
            inputRef.current?.blur();
        }
    };

    useShortcutSetting("searchManga", () => {
        inputRef.current?.focus();
    });

    return (
        <div
            className={`relative transition-all w-auto flex-grow lg:grow-0 lg:w-96 xl:w-128 ${
                isFocused ? "xl:w-[40rem] lg:w-128" : ""
            }`}
        >
            <div className="flex gap-2 relative">
                <Input
                    ref={inputRef}
                    type="search"
                    placeholder="Search manga..."
                    value={searchText}
                    onChange={handleSearchInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                    }}
                    aria-expanded={showPopup}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    aria-activedescendant={
                        focusedIndex >= 0
                            ? `search-result-${focusedIndex}`
                            : undefined
                    }
                    className="w-full hidden md:block h-8 bg-background!"
                />
                <KeyboardShortcut
                    keys={useSetting("searchManga")}
                    className={`hidden md:flex transition-opacity ${
                        isFocused ? "opacity-0" : "opacity-100"
                    }`}
                />
            </div>
            {showPopup && (
                <Card
                    ref={popupRef}
                    className="hidden absolute p-2 z-10 mt-1 m-auto md:w-full md:block"
                >
                    <CardContent className="p-2">
                        {isSearchLoading ? (
                            <div className="flex justify-center">
                                <Spinner />
                            </div>
                        ) : searchResults.length > 0 ? (
                            <>
                                {searchResults.map((result, index) => (
                                    <Link
                                        href={`/manga/${result.id}`}
                                            key={result.id}
                                            id={`search-result-${index}`}
                                            onMouseDown={() => {
                                                shouldCloseRef.current = false;
                                            }}
                                            className={`block p-2 hover:bg-accent flex items-center rounded-lg ${
                                                index === focusedIndex
                                                    ? "bg-accent"
                                                    : ""
                                            }`}
                                            prefetch={true}
                                        >
                                            <Image
                                                src={`/api/v1/image-proxy?imageUrl=${result.cover}`}
                                                alt={result.title}
                                                className="max-h-24 w-auto rounded mr-2"
                                                height={100}
                                                width={70}
                                            />
                                            {result.title}
                                        </Link>
                                    )
                                )}
                                <Link
                                    href={`/search?q=${encodeURIComponent(
                                        searchText
                                    )}`}
                                    className="block pt-4 mt-2 text-center text-primary hover:text-primary/80 border-t"
                                    onMouseDown={() => {
                                        shouldCloseRef.current = false;
                                    }}
                                >
                                    View all results
                                </Link>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No Results
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
