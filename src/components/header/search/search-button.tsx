"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Spinner from "@/components/ui/puff-loader";
import Image from "next/image";
import { getSearchResults } from "@/lib/api/search";
import { useQuery } from "@tanstack/react-query";

export default function SearchButton() {
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [open, setOpen] = useState(false);

    // Debounce search text
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchText]);

    // Fetch search results using React Query
    const {
        data: searchResults = { mangaList: [], totalPages: 0 },
        isLoading: isSearchLoading,
    } = useQuery({
        queryKey: ["search", debouncedSearchText],
        queryFn: () => getSearchResults(debouncedSearchText, 1, 3),
        enabled: debouncedSearchText.trim().length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleSearchInputChange = (e: { target: { value: string } }) => {
        const query = e.target.value;
        setSearchText(query);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden border touch-manipulation size-10"
                    aria-label="Search Manga"
                >
                    <Search className="size-5" />
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
                        <Spinner />
                    ) : searchResults.mangaList.length > 0 ? (
                        <>
                            {searchResults.mangaList.map(
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
                                            src={`/api/v1/image-proxy?imageUrl=${result.image}`}
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
