import { SearchItem } from "@/components/search/search-item";
import {
    Autocomplete,
    AutocompleteInput,
    AutocompleteList,
    AutocompletePopup,
    AutocompleteStatus,
} from "@/components/ui/autocomplete";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { Spinner } from "@/components/ui/spinner";
import { getSearchResults } from "@/lib/api/search";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useReducer, useRef, useState, useTransition } from "react";

type SearchResult = {
    id: string;
    title: string;
    cover: string;
    type: string;
};

type SearchState = {
    searchResults: SearchResult[];
    error: string | null;
};

type SearchAction =
    | { type: "CLEAR" }
    | { type: "SUCCESS"; results: SearchResult[] }
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

export default function SearchBar() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [{ searchResults, error }, dispatch] = useReducer(searchReducer, {
        searchResults: [] as SearchResult[],
        error: null,
    });
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
                    const results = await getSearchResults(searchValue.trim());
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

    useShortcutSetting("searchManga", () => {
        inputRef.current?.focus();
    });

    const handleSelect = (result: SearchResult) => {
        router.navigate({ to: "/manga/$mangaId", params: { mangaId: result.id } });
    };

    let status: ReactNode = `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`;
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
    } else if (searchResults.length === 0 && searchValue.trim()) {
        status = (
            <span className="font-normal text-muted-foreground text-sm">
                No results found for &ldquo;{searchValue}&rdquo;
            </span>
        );
    }

    const shouldRenderPopup = searchValue.trim() !== "";

    return (
        <div
            className={cn(
                "relative transition-all w-auto flex-grow lg:grow-0 lg:w-96 xl:w-128",
                isFocused && "xl:w-[40rem] lg:w-128",
            )}
        >
            <Autocomplete
                autoHighlight
                filter={null}
                items={searchResults}
                itemToStringValue={(item: unknown) =>
                    (item as SearchResult).title
                }
                onValueChange={setSearchValue}
                value={searchValue}
            >
                <AutocompleteInput
                    placeholder="Search manga..."
                    ref={inputRef}
                    className="w-full hidden md:block h-8"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    startAddon={<Search className="size-4.5 sm:size-4" />}
                    endAddon={
                        <KeyboardShortcut
                            className={`${isFocused ? "opacity-0" : "opacity-100"} transition-opacity`}
                            keys={useSetting("searchManga")}
                        />
                    }
                />
                {shouldRenderPopup && (
                    <AutocompletePopup aria-busy={isPending || undefined}>
                        <AutocompleteStatus className="text-muted-foreground">
                            {status}
                        </AutocompleteStatus>
                        <AutocompleteList>
                            {(result: SearchResult) => (
                                <SearchItem
                                    key={result.id}
                                    cover={result.cover}
                                    title={result.title}
                                    subtitle={result.type}
                                    value={result}
                                    onSelect={() => handleSelect(result)}
                                />
                            )}
                        </AutocompleteList>
                        <Link
                            to="/search"
                            search={{ query: searchValue }}
                            className={cn(
                                "block text-center text-primary hover:text-primary/80 font-medium text-sm px-3 py-1",
                                searchResults.length > 0 && "border-t",
                            )}
                            onClick={() => inputRef.current?.blur()}
                        >
                            View all results
                        </Link>
                    </AutocompletePopup>
                )}
            </Autocomplete>
        </div>
    );
}
