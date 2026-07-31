import { SearchItem } from "@/components/search/search-item";
import {
    Autocomplete,
    AutocompleteInput,
    AutocompleteList,
    AutocompletePopup,
    AutocompleteStatus,
} from "@/components/ui/autocomplete";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/api";
import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useReducer, useState, useTransition } from "react";

type BookmarkResult = components["schemas"]["BookmarkResponse"];

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

async function getBookmarkSearchResults(query: string) {
    const { data, error } = await client.GET("/v2/bookmarks/search", {
        params: { query: { query } },
    });
    if (error || !data) return [];
    return data.data.items;
}

export function BookmarkSearch() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [{ searchResults, error }, dispatch] = useReducer(searchReducer, {
        searchResults: [] as BookmarkResult[],
        error: null,
    });

    function handleSelect(result: BookmarkResult) {
        void router.navigate({
            to: "/manga/$mangaId",
            params: { mangaId: result.mangaId },
        });
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

    const hasSearchValue = searchValue.trim() !== "";
    return (
        <Autocomplete
            autoHighlight
            filter={null}
            items={searchResults}
            itemToStringValue={(item: BookmarkResult) => item.title}
            onValueChange={setSearchValue}
            value={searchValue}
        >
            <AutocompleteInput
                placeholder="Search bookmarks..."
                className="w-full"
                startAddon={<Search className="size-4.5 sm:size-4" />}
            />
            {hasSearchValue && (
                <AutocompletePopup
                    aria-busy={isPending || undefined}
                    align="start"
                >
                    <AutocompleteStatus className="text-muted-foreground">
                        <SearchStatus
                            isPending={isPending}
                            searchValue={searchValue}
                            searchResults={searchResults}
                            error={error}
                        />
                    </AutocompleteStatus>
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
    );
}

function SearchStatus({
    isPending,
    searchValue,
    searchResults,
    error,
}: {
    isPending: boolean;
    searchValue: string;
    searchResults: BookmarkResult[];
    error: string | null;
}) {
    if (isPending) {
        return (
            <span className="flex items-center justify-between gap-2 text-muted-foreground">
                Searching&hellip;
                <Spinner className="size-4.5 sm:size-4" />
            </span>
        );
    }
    if (error) {
        return (
            <span className="font-normal text-destructive text-sm">
                {error}
            </span>
        );
    }
    if (!searchResults && searchValue.trim() !== "") {
        return (
            <span className="font-normal text-muted-foreground text-sm">
                No bookmarks found for &ldquo;{searchValue}&rdquo;
            </span>
        );
    }
    if (searchResults && searchResults.length > 0) {
        return `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`;
    }
}
