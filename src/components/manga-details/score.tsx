"use client";

import { useState, useRef } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
    score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredFill, setHoveredFill] = useState<0 | 0.5 | 1>(0);
    const starRefs = useRef<(Element | null)[]>([]);

    const clampedScore = Math.max(0, Math.min(5, score));
    const fullStars = Math.floor(clampedScore);
    const hasHalfStar = clampedScore % 1 >= 0.5;
    const isAnyHovered = hoveredIndex !== null;

    const starClasses = "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8";

    const handleMouseMove = (
        index: number,
        event: React.MouseEvent<Element>
    ) => {
        const rect = starRefs.current[index]?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const isLeftHalf = event.clientX < centerX;
            setHoveredFill(isLeftHalf ? 0.5 : 1);
        }
    };

    const handleMouseEnter = (
        index: number,
        event: React.MouseEvent<Element>
    ) => {
        setHoveredIndex(index);
        // Calculate initial fill based on mouse position
        const rect = starRefs.current[index]?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const isLeftHalf = event.clientX < centerX;
            setHoveredFill(isLeftHalf ? 0.5 : 1);
        } else {
            setHoveredFill(1);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        setHoveredFill(0);
    };

    return (
        <div className="hidden w-full h-full bg-primary/10 rounded-xl  flex flex-col items-center justify-center p-4 lg:flex">
            <div className="flex flex-col items-center justify-center relative top-2.5">
                <div
                    className="flex items-center justify-center space-x-1"
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {[...Array(5)].map((_, index) => {
                        const isHovered =
                            hoveredIndex !== null && index <= hoveredIndex;
                        const isCurrentHovered = hoveredIndex === index;
                        const showHalf =
                            isCurrentHovered && hoveredFill === 0.5;
                        const showFull = isCurrentHovered && hoveredFill === 1;

                        return (
                            <div
                                key={index}
                                className={cn("relative", starClasses)}
                                ref={(el) => {
                                    starRefs.current[index] = el;
                                }}
                                onMouseEnter={(e) => handleMouseEnter(index, e)}
                                onMouseMove={(e) => handleMouseMove(index, e)}
                            >
                                {/* Background layer */}
                                <Star
                                    className={cn(
                                        "absolute inset-0 z-10",
                                        starClasses,
                                        "text-primary/20"
                                    )}
                                />
                                {/* Default score overlay */}
                                <div
                                    className={cn(
                                        "absolute inset-0 z-20 transition-opacity duration-200",
                                        isAnyHovered
                                            ? "opacity-0"
                                            : "opacity-100"
                                    )}
                                >
                                    <Star
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0",
                                            index < fullStars
                                                ? "text-primary"
                                                : "text-transparent"
                                        )}
                                    />
                                    {index === fullStars && hasHalfStar && (
                                        <StarHalf
                                            className={cn(
                                                starClasses,
                                                "absolute inset-0 text-primary"
                                            )}
                                        />
                                    )}
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 z-30">
                                    <Star
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0 text-accent-positive transition-opacity duration-200",
                                            isHovered && !isCurrentHovered
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <Star
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0 text-accent-positive transition-opacity duration-200",
                                            showFull
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <StarHalf
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0 text-accent-positive transition-opacity duration-200",
                                            showHalf
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-sm text-accent-foreground/70 h-5">
                    {score.toFixed(1)} / 5
                </p>
            </div>
        </div>
    );
}
