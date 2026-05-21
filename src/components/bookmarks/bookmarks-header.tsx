import { SearchItem } from "@/components/search/search-item";
import {
    Autocomplete,
    AutocompleteInput,
    AutocompleteList,
    AutocompletePopup,
    AutocompleteStatus,
} from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/api";
import { toastManager } from "@/components/ui/toast";
import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BookmarksDropdown } from "./bookmarks-dropdown";

type BookmarkResult = {
    mangaId: string;
    title: string;
    cover: string;
    type: string;
};

export default function BookmarksHeader() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<BookmarkResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function getBookmarkSearchResults(query: string) {
        const { data, error } = await client.GET("/v2/bookmarks/search", {
            params: { query: { query } },
        });
        if (error || !data) return [];
        return data.data.items;
    }

    useEffect(() => {
        if (!searchValue.trim()) {
            setSearchResults([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        let ignore = false;

        const timeoutId = setTimeout(async () => {
            try {
                const results = await getBookmarkSearchResults(
                    searchValue.trim(),
                );
                if (!ignore) setSearchResults(results);
            } catch {
                if (!ignore) {
                    setError("Failed to fetch results. Please try again.");
                    setSearchResults([]);
                }
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            ignore = true;
        };
    }, [searchValue]);

    async function exportBookmarks() {
        const allBookmarks: components["schemas"]["BookmarkListResponse"]["items"] =
            [];
        let currentPage = 1;
        let totalPages = 1;
        const pageSize = 100;

        while (currentPage <= totalPages) {
            const { data, error } = await client.GET("/v2/bookmarks", {
                params: {
                    query: {
                        page: currentPage,
                        pageSize,
                    },
                },
            });

            if (error || !data) {
                toastManager.add({ title: "Error fetching bookmarks", type: "error" });
                return;
            }

            allBookmarks.push(...data.data.items);
            totalPages = data.data.totalPages;
            currentPage++;
        }

        const bookmarksBlob = new Blob(
            [JSON.stringify(allBookmarks, null, 2)],
            { type: "application/json" },
        );
        const url = URL.createObjectURL(bookmarksBlob);
        const a = Object.assign(document.createElement("a"), {
            href: url,
            download: "bookmarks.json",
        });

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const handleSelect = (result: BookmarkResult) => {
        router.navigate({ to: "/manga/$id", params: { id: result.mangaId } });
    };

    let status: ReactNode;
    if (isLoading) {
        status = (
            <span className="flex items-center justify-between gap-2 text-muted-foreground">
                Searching...
                <Spinner className="size-4.5 sm:size-4" />
            </span>
        );
    } else if (error) {
        status = (
            <span className="font-normal text-destructive text-sm">
                {error}
            </span>
        );
    } else if (searchResults.length > 0) {
        status = `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`;
    } else if (searchValue.trim()) {
        status = (
            <span className="font-normal text-muted-foreground text-sm">
                No bookmarks found for &ldquo;{searchValue}&rdquo;
            </span>
        );
    }

    const shouldRenderPopup = searchValue.trim() !== "";

    return (
        <div className="relative mb-4">
            <div className="flex flex-row gap-2 md:gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="hidden md:flex w-auto md:h-auto items-center justify-center px-4"
                    onClick={exportBookmarks}
                >
                    Export Bookmarks
                </Button>
                <div className="relative w-full">
                    <Autocomplete
                        autoHighlight
                        filter={null}
                        items={searchResults}
                        itemToStringValue={(item: unknown) =>
                            (item as BookmarkResult).title
                        }
                        onValueChange={setSearchValue}
                        value={searchValue}
                    >
                        <AutocompleteInput
                            placeholder="Search bookmarks..."
                            className="w-full"
                            startAddon={
                                <Search className="size-4.5 sm:size-4" />
                            }
                        />
                        {shouldRenderPopup && (
                            <AutocompletePopup
                                aria-busy={isLoading || undefined}
                                align="start"
                            >
                                {status && (
                                    <AutocompleteStatus className="text-muted-foreground">
                                        {status}
                                    </AutocompleteStatus>
                                )}
                                <AutocompleteList>
                                    {(result: BookmarkResult) => (
                                        <SearchItem
                                            key={result.mangaId}
                                            cover={result.cover}
                                            title={result.title}
                                            subtitle={result.type}
                                            value={result}
                                            onSelect={() =>
                                                handleSelect(result)
                                            }
                                        />
                                    )}
                                </AutocompleteList>
                            </AutocompletePopup>
                        )}
                    </Autocomplete>
                </div>
                <BookmarksDropdown exportBookmarks={exportBookmarks} />
            </div>
        </div>
    );
}
