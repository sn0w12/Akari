"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import Spinner from "@/components/ui/puff-loader";
import { getSearchResults } from "@/lib/api/search";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { cn, generateSizes } from "@/lib/utils";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function SearchBar() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebouncedValue(searchText, {
        wait: 300,
    });
    const [isFocused, setIsFocused] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const shouldCloseRef = useRef(true);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasSearchText = searchText.trim().length > 0;

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
            inputRef.current?.blur();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : prev,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Escape") {
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
                    role="combobox"
                    aria-expanded={isFocused}
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
            {isFocused && (
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
                                            src={result.cover}
                                            alt={result.title}
                                            className="max-h-24 w-auto rounded mr-2"
                                            height={144}
                                            width={96}
                                            quality={40}
                                            sizes={generateSizes({
                                                default: "96px",
                                            })}
                                        />
                                        {result.title}
                                    </Link>
                                ))}
                            </>
                        ) : hasSearchText ? (
                            <div className="text-center text-muted-foreground p-4">
                                No Results
                            </div>
                        ) : null}
                        <Link
                            href={`/search?q=${encodeURIComponent(searchText)}`}
                            className={cn(
                                "block text-center text-primary hover:text-primary/80",
                                {
                                    "border-t pt-4 mt-2": hasSearchText,
                                },
                            )}
                            onMouseDown={() => {
                                shouldCloseRef.current = false;
                            }}
                        >
                            {hasSearchText
                                ? "View all results"
                                : "Go to search page"}
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
