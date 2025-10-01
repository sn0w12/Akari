"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
    score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const clampedScore = Math.max(0, Math.min(5, score));
    const fullStars = Math.floor(clampedScore);
    const hasHalfStar = clampedScore % 1 >= 0.5;

    const starClasses = "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-colors";

    return (
        <div className="hidden w-full h-full bg-primary/10 rounded-xl  flex flex-col items-center justify-center p-4 lg:flex">
            <div className="flex flex-col items-center justify-center relative top-2.5">
                <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className="relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <Star
                                className={cn(
                                    "absolute z-10",
                                    starClasses,
                                    hoveredIndex !== null &&
                                        index <= hoveredIndex
                                        ? "text-accent-positive"
                                        : index < fullStars
                                        ? "text-primary"
                                        : "text-primary/25"
                                )}
                            />
                            {index === fullStars && hasHalfStar ? (
                                <>
                                    <StarHalf
                                        className={`relative ${starClasses} text-primary z-20 transition-opacity ${
                                            hoveredIndex !== null &&
                                            index <= hoveredIndex
                                                ? "opacity-0"
                                                : "opacity-100"
                                        }`}
                                    />
                                    <Star
                                        className={`absolute top-0 ${starClasses} text-accent-positive transition-opacity z-20 ${
                                            hoveredIndex !== null &&
                                            index <= hoveredIndex
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                </>
                            ) : (
                                <Star
                                    className={`relative ${starClasses} text-primary/0 z-20`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-accent-foreground/70 h-5">
                    {score.toFixed(1)} / 5
                </p>
            </div>
        </div>
    );
}
