"use client";

import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { StarHalf } from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import { RateDialog } from "./rate-dialog";

interface ScoreDisplayProps {
    mangaId: string;
    rating: components["schemas"]["MangaRatingResponse"];
}

type HoverFill = "empty" | "half" | "full";

export function ScoreDisplay({ mangaId, rating }: ScoreDisplayProps) {
    const { data: user } = useUser();
    const [hoverState, setHoverState] = useState<{
        index: number;
        fill: 0.5 | 1;
    } | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [initialRating, setInitialRating] = useState<number>(0);
    const starRefs = useRef<(HTMLDivElement | null)[]>([]);

    const score = useMemo(
        () => Math.max(0, Math.min(5, rating.average / 2)),
        [rating.average],
    );

    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    const getFillFromEvent = (index: number, clientX: number): 0.5 | 1 => {
        const rect = starRefs.current[index]?.getBoundingClientRect();
        if (rect) {
            return clientX < rect.left + rect.width / 2 ? 0.5 : 1;
        }
        return 1;
    };

    const handleMouseMove = (
        index: number,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        const fill = getFillFromEvent(index, event.clientX);
        // Only update if fill actually changed to avoid unnecessary re-renders
        setHoverState((prev) =>
            prev?.index === index && prev.fill === fill
                ? prev
                : { index, fill },
        );
    };

    const handleMouseEnter = (
        index: number,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        setHoverState({ index, fill: getFillFromEvent(index, event.clientX) });
    };

    // Compute the display fill for each star given current hover state
    const getHoverFill = (index: number): HoverFill => {
        if (!hoverState) return "empty";
        if (index < hoverState.index) return "full";
        if (index === hoverState.index)
            return hoverState.fill === 0.5 ? "half" : "full";
        return "empty";
    };

    return (
        <div className="flex w-full h-full bg-primary/10 rounded-xl flex-col items-center justify-center p-2 xl:p-4">
            <div className="flex flex-col items-center justify-center relative top-1 xl:top-2.5">
                <div
                    className="flex items-center justify-center space-x-1"
                    onMouseLeave={() => setHoverState(null)}
                >
                    {[...Array(5)].map((_, index) => {
                        const hoverFill = getHoverFill(index);
                        const isAnyHovered = hoverState !== null;

                        return (
                            <div
                                key={index}
                                className={
                                    "relative cursor-pointer size-6 md:size-7 xl:size-8"
                                }
                                ref={(el) => {
                                    starRefs.current[index] = el;
                                }}
                                onMouseEnter={(e) => handleMouseEnter(index, e)}
                                onMouseMove={(e) => handleMouseMove(index, e)}
                                onClick={() => {
                                    if (!user || !hoverState) return;
                                    setInitialRating(
                                        (hoverState.index + hoverState.fill) *
                                            2,
                                    );
                                    setDialogOpen(true);
                                }}
                            >
                                <ScoreStars
                                    index={index}
                                    hoverFill={hoverFill}
                                    isAnyHovered={isAnyHovered}
                                    fullStars={fullStars}
                                    hasHalfStar={hasHalfStar}
                                />
                            </div>
                        );
                    })}
                </div>
                <p className="text-sm text-accent-foreground/70 h-5">
                    {score.toFixed(1)} / 5
                </p>
            </div>
            <RateDialog
                key={`${dialogOpen}-${initialRating}`}
                mangaId={mangaId}
                rating={rating}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialRating={initialRating}
            />
        </div>
    );
}

const starClasses = "size-6 md:size-7 xl:size-8 transition-colors duration-200";
const ScoreStars = memo(function ScoreStars({
    index,
    hoverFill,
    isAnyHovered,
    fullStars,
    hasHalfStar,
}: {
    index: number;
    hoverFill: HoverFill;
    isAnyHovered: boolean;
    fullStars: number;
    hasHalfStar: boolean;
}) {
    const isFirstVisible =
        index < fullStars ||
        (index === fullStars && hasHalfStar) ||
        hoverFill === "half" ||
        hoverFill === "full";
    const isSecondVisible =
        index < fullStars || (index === fullStars && hoverFill === "full");

    return (
        <>
            <StarHalf
                className={cn(starClasses, "absolute text-ring inset-0", {
                    "text-primary": !isAnyHovered,
                    "text-accent-positive": hoverFill !== "empty",
                    "text-ring": !isFirstVisible,
                })}
            />
            <StarHalf
                className={cn(
                    starClasses,
                    "absolute inset-0 text-ring -scale-x-100",
                    {
                        "text-primary": !isAnyHovered,
                        "text-accent-positive": hoverFill === "full",
                        "text-ring": !isSecondVisible,
                    },
                )}
            />
        </>
    );
});
