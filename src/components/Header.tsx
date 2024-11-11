"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { debounce } from "lodash";
import { Search, Bookmark } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import LoginDialog from "./ui/Header/AccountDialog";
import Icon from "./ui/Header/Icon";
import Image from "next/image";
import SettingsDialog from "./ui/Header/SettingsDialog";
import ThemeToggle from "./ui/Header/ThemeToggle";

interface Manga {
    id: string;
    image: string;
    title: string;
    chapter: string;
    chapterUrl: string;
    rating: string;
    author: string;
}

export function HeaderComponent() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [notification, setNotification] = useState("");
    const popupRef = useRef<HTMLDivElement | null>(null);

    // Debounce function for fetching search results
    const debouncedFetchResults = useCallback(
        debounce(async (query) => {
            if (query) {
                setIsSearchLoading(true);
                setShowPopup(true);
                try {
                    const res = await fetch(
                        `/api/search?search=${query.replaceAll(" ", "_")}`,
                    );
                    const data = await res.json();
                    const firstFiveResults = data.mangaList.slice(0, 5);
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

    // Handle search input changes
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

    const fetchNotification = useMemo(
        () => async () => {
            try {
                const res = await fetch(`/api/bookmarks/notification`);

                if (!res.ok) {
                    setNotification("");
                    return;
                }

                const data = await res.json();
                setNotification(data);
            } catch (error) {
                console.error("Error fetching search results:", error);
            }
        },
        [],
    );

    const debouncedFetchNotification = useCallback(
        debounce(fetchNotification, 10),
        [fetchNotification],
    );

    useEffect(() => {
        debouncedFetchNotification();

        // Cleanup to cancel the debounced function when the component unmounts or dependencies change
        return () => {
            debouncedFetchNotification.cancel();
        };
    }, [debouncedFetchNotification]);

    return (
        <header className="sticky top-0 z-50 bg-background border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold title">
                    <Icon />
                </Link>

                <div className="flex items-center space-x-4 flex-grow justify-end">
                    <div className="relative xl:w-128 lg:w-96 lg:grow-0 ml-6 w-auto flex-grow">
                        <Input
                            type="search"
                            placeholder="Search manga..."
                            value={searchText}
                            onChange={handleSearchInputChange}
                            onBlur={handleInputBlur}
                            onFocus={() =>
                                searchResults.length > 0 && setShowPopup(true)
                            }
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
                                        searchResults.map((result: Manga) => (
                                            <Link
                                                href={`/manga/${result.id}`}
                                                key={result.id}
                                                onClick={() =>
                                                    setShowPopup(false)
                                                }
                                                className="block p-2 hover:bg-accent flex items-center rounded-lg"
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
                    <div className="flex gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="sm:hidden"
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="">
                                <DialogHeader>
                                    <DialogTitle>Search</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col space-y-4 border-t">
                                    <div className="flex items-center justify-start gap-2">
                                        <Input
                                            type="search"
                                            placeholder="Search manga..."
                                            value={searchText}
                                            onChange={handleSearchInputChange}
                                            onBlur={handleInputBlur}
                                            onFocus={() =>
                                                searchResults.length > 0 &&
                                                setShowPopup(true)
                                            }
                                            className="w-full block sm:hidden mt-4"
                                        />
                                    </div>
                                    {isSearchLoading ? (
                                        <CenteredSpinner />
                                    ) : searchResults.length > 0 ? (
                                        searchResults
                                            .slice(0, 3)
                                            .map((result: Manga) => (
                                                <Link
                                                    href={`/manga/${result.id}`}
                                                    key={result.id}
                                                    className="block p-2 hover:bg-accent flex items-center rounded-lg border"
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
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Link
                            href="/bookmarks"
                            className={
                                !notification ? "pointer-events-none" : ""
                            }
                        >
                            <div className="relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="group-hover:bg-accent"
                                    disabled={!notification}
                                >
                                    <Bookmark className="h-5 w-5" />
                                </Button>
                                {/* Badge element */}
                                {notification && (
                                    <span
                                        className="absolute bg-red-500 text-white text-xs font-bold rounded-full px-2 h-5 flex items-center justify-center transform translate-x-1/4 translate-y-1/4"
                                        style={{ bottom: "0", right: "0" }}
                                    >
                                        {notification}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Account Information Dialog */}
                        <LoginDialog />

                        {/* Settings Dialog */}
                        <SettingsDialog />

                        {/* Theme Toggle Button */}
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
