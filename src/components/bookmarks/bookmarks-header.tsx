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
import { toastManager } from "@/components/ui/toast";
import { client } from "@/lib/api";
import { exportBookmarks } from "@/lib/manga/export-bookmarks";
import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useReducer, useState, useTransition } from "react";

type BookmarkResult = {
    mangaId: string;
    title: string;
    cover: string;
    type: string;
};

type SearchState = {
    searchResults: BookmarkResult[];
    error: string | null;
};

type SearchAction =
    | { type: "CLEAR" }
    | { type: "SUCCESS"; results: BookmarkResult[] }
    | { type: "ERROR"; error: string }
    | { type: "CLEAR_ERROR" };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
    switch (action.type) {
        case "CLEAR":
            return { searchResults: [], error: null };
        case "SUCCESS":
            return { searchResults: action.results, error: null };
        case "ERROR":
            return { searchResults: [], error: action.error };
        case "CLEAR_ERROR":
            return { ...state, error: null };
    }
}

export default function BookmarksHeader() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isExporting, setIsExporting] = useState(false);
    const [{ searchResults, error }, dispatch] = useReducer(searchReducer, {
        searchResults: [] as BookmarkResult[],
        error: null,
    });

    async function getBookmarkSearchResults(query: string) {
        const { data, error } = await client.GET("/v2/bookmarks/search", {
            params: { query: { query } },
        });
        if (error || !data) return [];
        return data.data.items;
    }

    useEffect(() => {
        if (!searchValue.trim()) {
            startTransition(() => {
                dispatch({ type: "CLEAR" });
            });
            return;
        }

        dispatch({ type: "CLEAR_ERROR" });
        let ignore = false;

        const timeoutId = setTimeout(() => {
            startTransition(async () => {
                try {
                    const results = await getBookmarkSearchResults(
                        searchValue.trim(),
                    );
                    if (!ignore) dispatch({ type: "SUCCESS", results });
                } catch {
                    if (!ignore) {
                        dispatch({
                            type: "ERROR",
                            error: "Failed to fetch results. Please try again.",
                        });
                    }
                }
            });
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            ignore = true;
        };
    }, [searchValue]);

    function handleExportBookmarks() {
        startTransition(() => {
            setIsExporting(true);
            void exportBookmarks()
                .catch(() => {
                    toastManager.add({
                        title: "Error fetching bookmarks",
                        type: "error",
                    });
                })
                .finally(() => {
                    setIsExporting(false);
                });
        });
    }

    const handleSelect = (result: BookmarkResult) => {
        void router.navigate({
            to: "/manga/$mangaId",
            params: { mangaId: result.mangaId },
        });
    };

    let status: ReactNode;
    if (isPending) {
        status = (
            <span className="flex items-center justify-between gap-2 text-muted-foreground">
                Searching&hellip;
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
                    loading={isExporting}
                    onClick={handleExportBookmarks}
                >
                    Export Bookmarks
                </Button>
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
                        startAddon={<Search className="size-4.5 sm:size-4" />}
                    />
                    {shouldRenderPopup && (
                        <AutocompletePopup
                            aria-busy={isPending || undefined}
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
                                        onSelect={() => handleSelect(result)}
                                    />
                                )}
                            </AutocompleteList>
                        </AutocompletePopup>
                    )}
                </Autocomplete>
            </div>
        </div>
    );
}
