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
import { SmallManga } from "@/app/api/interfaces";
import { getSearchResults } from "./searchFunctions";

export default function SearchButton() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const debouncedFetchResults = useCallback(
        debounce(async (query) => {
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
        }, 300), // 300ms debounce delay
        [],
    );

    const handleSearchInputChange = (e: { target: { value: string } }) => {
        const query = e.target.value;
        setSearchText(query);
        debouncedFetchResults(query);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
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
                            className="w-full block sm:hidden mt-4"
                        />
                    </div>
                    {isSearchLoading ? (
                        <CenteredSpinner />
                    ) : searchResults.length > 0 ? (
                        searchResults.map((result: SmallManga) => (
                            <Link
                                href={`/manga/${result.id}`}
                                key={result.id}
                                onClick={() => setOpen(false)}
                                className="block p-2 hover:bg-accent flex items-center rounded-lg border"
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
