"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PopoverDrawer,
    PopoverDrawerContent,
    PopoverDrawerTrigger,
} from "@/components/ui/popover-drawer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GENRE_CATEGORIES, Genre, MANGA_TYPES } from "@/lib/api/search";
import { cn } from "@/lib/utils";
import { FilterIcon } from "lucide-react";

export interface SearchFilters {
    genres: Genre[];
    excludedGenres: Genre[];
    types: (typeof MANGA_TYPES)[number][];
    excludedTypes: (typeof MANGA_TYPES)[number][];
    sort: "search" | "popular" | "latest";
}

interface FiltersProps {
    filters: SearchFilters;
    onChange: (filters: SearchFilters) => void;
}

type FilterState = "neutral" | "include" | "exclude";

function getNextState(state: FilterState): FilterState {
    if (state === "neutral") return "include";
    if (state === "include") return "exclude";
    return "neutral";
}

function Filter({
    label,
    state,
    onStateChange,
}: {
    label: string;
    state: FilterState;
    onStateChange: (state: FilterState) => void;
}) {
    const nextState = getNextState(state);
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStateChange(nextState)}
            className={cn(
                "w-full justify-between gap-2 px-2",
                state === "include" &&
                    "bg-accent-positive/15 border-accent-positive/40 text-accent-positive hover:bg-accent-positive/20 hover:border-accent-positive/50 dark:bg-accent-positive/15 dark:border-accent-positive/40 dark:text-accent-positive dark:hover:bg-accent-positive/20 dark:hover:border-accent-positive/50",
                state === "exclude" &&
                    "bg-destructive/15 border-destructive/40 text-destructive hover:bg-destructive/20 hover:border-destructive/50 dark:bg-destructive/15 dark:border-destructive/40 dark:text-destructive dark:hover:bg-destructive/20 dark:hover:border-destructive/50",
            )}
            aria-pressed={state !== "neutral"}
        >
            <span className="truncate text-sm md:text-xs">{label}</span>
        </Button>
    );
}

export function FiltersContent({ filters, onChange }: FiltersProps) {
    const updateFilters = <K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K],
    ) => {
        onChange({ ...filters, [key]: value });
    };

    const addUnique = <T,>(items: T[], item: T) =>
        items.includes(item) ? items : [...items, item];

    const handleGenreStateChange = (genre: Genre, state: FilterState) => {
        if (state === "include") {
            onChange({
                ...filters,
                genres: addUnique(filters.genres, genre),
                excludedGenres: filters.excludedGenres.filter(
                    (g) => g !== genre,
                ),
            });
            return;
        }

        if (state === "exclude") {
            onChange({
                ...filters,
                genres: filters.genres.filter((g) => g !== genre),
                excludedGenres: addUnique(filters.excludedGenres, genre),
            });
            return;
        }

        onChange({
            ...filters,
            genres: filters.genres.filter((g) => g !== genre),
            excludedGenres: filters.excludedGenres.filter((g) => g !== genre),
        });
    };

    const handleTypeStateChange = (
        type: (typeof MANGA_TYPES)[number],
        state: FilterState,
    ) => {
        if (state === "include") {
            onChange({
                ...filters,
                types: addUnique(filters.types, type),
                excludedTypes: filters.excludedTypes.filter((t) => t !== type),
            });
            return;
        }

        if (state === "exclude") {
            onChange({
                ...filters,
                types: filters.types.filter((t) => t !== type),
                excludedTypes: addUnique(filters.excludedTypes, type),
            });
            return;
        }

        onChange({
            ...filters,
            types: filters.types.filter((t) => t !== type),
            excludedTypes: filters.excludedTypes.filter((t) => t !== type),
        });
    };

    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold">Sorting</h2>
            <Select
                value={filters.sort}
                onValueChange={(value) =>
                    updateFilters("sort", value as SearchFilters["sort"])
                }
            >
                <SelectTrigger size="sm" className="min-w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent align="center">
                    <SelectItem value="search">Default</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                </SelectContent>
            </Select>

            <h2 className="text-sm font-semibold">Filter by Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                {MANGA_TYPES.map((type) => (
                    <Filter
                        key={type}
                        label={type}
                        state={
                            filters.types.includes(type)
                                ? "include"
                                : filters.excludedTypes.includes(type)
                                  ? "exclude"
                                  : "neutral"
                        }
                        onStateChange={(state) =>
                            handleTypeStateChange(type, state)
                        }
                    />
                ))}
            </div>

            <h2 className="text-sm font-semibold">Filter by Genre</h2>
            {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                <div key={category}>
                    <h3 className="text-xs font-medium mb-1 text-muted-foreground">
                        {category}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                        {genres.map((genre) => (
                            <Filter
                                key={genre}
                                label={genre}
                                state={
                                    filters.genres.includes(genre)
                                        ? "include"
                                        : filters.excludedGenres.includes(genre)
                                          ? "exclude"
                                          : "neutral"
                                }
                                onStateChange={(state) =>
                                    handleGenreStateChange(genre, state)
                                }
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function Filters({ filters, onChange }: FiltersProps) {
    return (
        <PopoverDrawer>
            <PopoverDrawerTrigger>
                <Button variant="outline">
                    <FilterIcon className="w-4 h-4" />
                    Filter
                    {(filters.genres.length > 0 ||
                        filters.types.length > 0 ||
                        filters.excludedGenres.length > 0 ||
                        filters.excludedTypes.length > 0) && (
                        <Badge className="px-1">
                            {filters.genres.length +
                                filters.types.length +
                                filters.excludedGenres.length +
                                filters.excludedTypes.length}
                        </Badge>
                    )}
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent popoverClassName="w-80 md:w-128">
                <FiltersContent filters={filters} onChange={onChange} />
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
}
