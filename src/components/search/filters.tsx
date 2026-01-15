"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GENRE_CATEGORIES, Genre, MANGA_TYPES } from "@/lib/api/search";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

export interface SearchFilters {
    genres: Genre[];
    types: (typeof MANGA_TYPES)[number][];
    sort: "search" | "popular" | "latest";
}

interface FiltersProps {
    filters: SearchFilters;
    onChange: (filters: SearchFilters) => void;
}

function Filter({
    label,
    checked,
    onCheckedChange,
}: {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center space-x-1">
            <Checkbox
                id={label}
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="size-5 md:size-4"
            />
            <Label
                htmlFor={label}
                className="text-sm md:text-xs cursor-pointer leading-none"
            >
                {label}
            </Label>
        </div>
    );
}

export function Filters({ filters, onChange }: FiltersProps) {
    const updateFilters = <K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K],
    ) => {
        onChange({ ...filters, [key]: value });
    };

    const handleGenreToggle = (
        genre: Genre,
        checked: boolean | "indeterminate",
    ) => {
        if (checked === true) {
            updateFilters("genres", [...filters.genres, genre]);
        } else {
            updateFilters(
                "genres",
                filters.genres.filter((g) => g !== genre),
            );
        }
    };

    const handleTypeToggle = (
        type: (typeof MANGA_TYPES)[number],
        checked: boolean | "indeterminate",
    ) => {
        if (checked === true) {
            updateFilters("types", [...filters.types, type]);
        } else {
            updateFilters(
                "types",
                filters.types.filter((t) => t !== type),
            );
        }
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
                <SelectContent>
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
                        checked={filters.types.includes(type)}
                        onCheckedChange={(checked) =>
                            handleTypeToggle(type, checked)
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
                                checked={filters.genres.includes(genre)}
                                onCheckedChange={(checked) =>
                                    handleGenreToggle(genre, checked)
                                }
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
