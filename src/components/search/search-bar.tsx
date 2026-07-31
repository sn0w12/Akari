import { SearchItem } from "@/components/search/search-item";
import {
    Autocomplete,
    AutocompleteInput,
    AutocompleteList,
    AutocompletePopup,
    AutocompleteStatus,
} from "@/components/ui/autocomplete";
import { Spinner } from "@/components/ui/spinner";
import { Link, useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useReducer, useRef, useState, useTransition } from "react";
import { KeyboardShortcut } from "../ui/keyboard-shortcut";
import { cn } from "@/lib/utils";
import { RegisterableHotkey } from "@tanstack/react-hotkeys";
import { useOptionalHotkey } from "@/hooks/use-optional-hotkey";

export type SearchResult = Pick<
    components["schemas"]["MangaResponse"],
    "id" | "cover" | "title" | "type"
>;

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

interface SearchBarProps {
    getSearchResults: (search: string) => Promise<SearchResult[]>;
    shortcut?: RegisterableHotkey;
    className?: string;
    focusClassName?: string;
    moreUrl?: string;
}

export function SearchBar({
    getSearchResults,
    shortcut,
    className,
    focusClassName,
    moreUrl,
}: SearchBarProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [{ searchResults, error }, dispatch] = useReducer(searchReducer, {
        searchResults: [],
        error: null,
    });

    function handleSelect(result: SearchResult) {
        void router.navigate({
            to: "/manga/$mangaId",
            params: { mangaId: result.id },
        });
    }

    useOptionalHotkey(shortcut, () => {
        inputRef.current?.focus();
    });

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
    }, [searchValue, getSearchResults]);

    const hasSearchValue = searchValue.trim() !== "";
    return (
        <div className={cn(className, isFocused && focusClassName)}>
            <Autocomplete
                autoHighlight
                filter={null}
                items={searchResults}
                itemToStringValue={(item: SearchResult) => item.title}
                onValueChange={setSearchValue}
                value={searchValue}
            >
                <AutocompleteInput
                    ref={inputRef}
                    placeholder="Search bookmarks..."
                    className="w-full"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    startAddon={<Search className="size-4.5 sm:size-4" />}
                    endAddon={
                        shortcut ? (
                            <KeyboardShortcut
                                className={`${isFocused ? "opacity-0" : "opacity-100"} transition-opacity`}
                                keys={shortcut}
                            />
                        ) : undefined
                    }
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
                        {moreUrl && (
                            <Link
                                to={moreUrl}
                                search={{ query: searchValue }}
                                className={cn(
                                    "block text-center text-primary hover:text-primary/80 font-medium text-sm mx-1 py-1",
                                    searchResults.length > 0 && "border-t",
                                )}
                                onClick={() => inputRef.current?.blur()}
                            >
                                View all results
                            </Link>
                        )}
                    </AutocompletePopup>
                )}
            </Autocomplete>
        </div>
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
    searchResults: SearchResult[];
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
