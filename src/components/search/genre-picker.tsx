"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GENRE_CATEGORIES, Genre } from "@/lib/api/search";

interface GenrePickerProps {
    selectedGenres: Genre[];
    onChange: (genres: Genre[]) => void;
}

export default function GenrePicker({
    selectedGenres,
    onChange,
}: GenrePickerProps) {
    const handleGenreChange = (
        genre: Genre,
        checked: boolean | "indeterminate"
    ) => {
        if (checked === true) {
            onChange([...selectedGenres, genre]);
        } else {
            onChange(selectedGenres.filter((g) => g !== genre));
        }
    };

    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold">Filter by Genre</h2>
            {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                <div key={category}>
                    <h3 className="text-xs font-medium mb-1 text-muted-foreground">
                        {category}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                        {genres.map((genre) => (
                            <div
                                key={genre}
                                className="flex items-center space-x-1"
                            >
                                <Checkbox
                                    id={genre}
                                    checked={selectedGenres.includes(genre)}
                                    onCheckedChange={(checked) =>
                                        handleGenreChange(genre, checked)
                                    }
                                    className="size-5 md:size-4"
                                />
                                <Label
                                    htmlFor={genre}
                                    className="text-sm md:text-xs cursor-pointer leading-none"
                                >
                                    {genre}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
