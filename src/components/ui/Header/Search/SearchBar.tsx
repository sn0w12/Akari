"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { debounce } from "lodash";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import Image from "next/image";
import { SmallManga } from "@/app/api/interfaces";
import { getSearchResults } from "./searchFunctions";
import { useShortcut } from "@/hooks/useShortcut";
import { KeyboardShortcut } from "../../Shortcuts/KeyboardShortcuts";
import { getSetting, useSettingsChange } from "@/lib/settings";

export default function SearchBar() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<
        {
            id: string;
            title: string;
            image: string;
        }[]
    >([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [shortcut, setShortcut] = useState<string | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useSettingsChange((event) => {
        setShortcut(event.detail.value ? String(event.detail.value) : null);
    }, "searchManga");

    useEffect(() => {
        setShortcut(getSetting("searchManga"));
    }, []);

    const debouncedFetchResults = useCallback(
        debounce(async (query) => {
            if (query) {
                setIsSearchLoading(true);
                setShowPopup(true);
                try {
                    const firstFiveResults = await getSearchResults(query, 5);
                    setSearchResults(firstFiveResults);
                } catch (error) {
                    console.error("Error fetching search results:", error);
                } finally {
                    setIsSearchLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowPopup(false);
            }
        }, 300), // 300ms debounce delay
        [],
    );

    const handleSearchInputChange = (e: { target: { value: string } }) => {
        const query = e.target.value;
        setSearchText(query);
        debouncedFetchResults(query);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (
            popupRef.current &&
            !popupRef.current.contains(e.relatedTarget as Node)
        ) {
            setShowPopup(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            router.push(`/search?q=${encodeURIComponent(searchText)}`);
            setShowPopup(false);
        }
    };

    useShortcut(
        shortcut || "",
        () => {
            inputRef.current?.focus();
        },
        { preventDefault: true },
    );

    return (
        <div
            className={`relative transition-all w-auto flex-grow ml-6 lg:grow-0 lg:w-96 xl:w-128 ${
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
                        searchResults.length > 0 && setShowPopup(true);
                    }}
                    className="w-full hidden sm:block"
                />
                {shortcut && (
                    <KeyboardShortcut
                        keys={shortcut.split("+")}
                        className={`hidden sm:flex transition-opacity ${isFocused ? "opacity-0" : "opacity-100"}`}
                    />
                )}
            </div>
            {showPopup && (
                <Card
                    ref={popupRef}
                    className="hidden absolute p-2 z-10 mt-1 m-auto sm:w-full sm:block"
                >
                    <CardContent className="p-2">
                        {isSearchLoading ? (
                            <CenteredSpinner />
                        ) : searchResults.length > 0 ? (
                            <>
                                {searchResults.map(
                                    (result: {
                                        id: string;
                                        title: string;
                                        image: string;
                                    }) => (
                                        <Link
                                            href={`/manga/${result.id}`}
                                            key={result.id}
                                            onClick={() => setShowPopup(false)}
                                            className="block p-2 hover:bg-accent flex items-center rounded-lg"
                                            prefetch={true}
                                        >
                                            <Image
                                                src={`/api/image-proxy?imageUrl=${result.image}`}
                                                alt={result.title}
                                                className="max-h-24 w-auto rounded mr-2"
                                                height={100}
                                                width={70}
                                            />
                                            {result.title}
                                        </Link>
                                    ),
                                )}
                                <Link
                                    href={`/search?q=${encodeURIComponent(searchText)}`}
                                    className="block pt-4 mt-2 text-center text-primary hover:text-primary/80 border-t"
                                    onClick={() => setShowPopup(false)}
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
