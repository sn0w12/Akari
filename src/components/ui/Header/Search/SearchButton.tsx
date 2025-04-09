"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import Image from "next/image";
import { getSearchResults } from "./searchFunctions";

export default function SearchButton() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<
        {
            id: string;
            title: string;
            image: string;
        }[]
    >([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const debouncedFetchResults = useCallback(() => {
        const fetchResults = debounce(async (query: string) => {
            if (query) {
                setIsSearchLoading(true);
                try {
                    const firstFiveResults = await getSearchResults(query, 3);
                    setSearchResults(firstFiveResults);
                } catch (error) {
                    console.error("Error fetching search results:", error);
                } finally {
                    setIsSearchLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce delay

        return fetchResults;
    }, [setSearchResults, setIsSearchLoading]);

    const handleSearchInputChange = (e: { target: { value: string } }) => {
        const query = e.target.value;
        setSearchText(query);
        debouncedFetchResults()(query);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden border touch-manipulation"
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
                            className="w-full block md:hidden mt-4 touch-manipulation"
                        />
                    </div>
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
                                        onClick={() => setOpen(false)}
                                        className="block p-2 hover:bg-accent flex items-center rounded-lg border"
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
                                onClick={() => setOpen(false)}
                            >
                                View all results
                            </Link>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            No Results
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
