"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { debounce } from "lodash";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import Image from "next/image";
import { SmallManga } from "@/app/api/interfaces";
import { getSearchResults } from "./searchFunctions";

export default function SearchBar() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef<HTMLDivElement | null>(null);

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
        if (
            popupRef.current &&
            !popupRef.current.contains(e.relatedTarget as Node)
        ) {
            setShowPopup(false);
        }
    };

    return (
        <div className="relative xl:w-128 lg:w-96 lg:grow-0 ml-6 w-auto flex-grow">
            <Input
                type="search"
                placeholder="Search manga..."
                value={searchText}
                onChange={handleSearchInputChange}
                onBlur={handleInputBlur}
                onFocus={() => searchResults.length > 0 && setShowPopup(true)}
                className="w-full hidden sm:block"
            />
            {showPopup && (
                <Card
                    ref={popupRef}
                    className="hidden absolute p-2 z-10 mt-1 m-auto sm:w-full sm:block"
                >
                    <CardContent className="p-2">
                        {isSearchLoading ? (
                            <CenteredSpinner />
                        ) : searchResults.length > 0 ? (
                            searchResults.map((result: SmallManga) => (
                                <Link
                                    href={`/manga/${result.id}`}
                                    key={result.id}
                                    onClick={() => setShowPopup(false)}
                                    className="block p-2 hover:bg-accent flex items-center rounded-lg"
                                    prefetch={true}
                                >
                                    <Image
                                        src={result.image}
                                        alt={result.title}
                                        className="max-h-24 w-auto rounded mr-2"
                                        height={100}
                                        width={70}
                                    />
                                    {result.title}
                                </Link>
                            ))
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
