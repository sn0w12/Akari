"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { client } from "@/lib/api";
import Toast from "@/lib/toast-wrapper";
import { cn, formatNumberShort } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, StarHalf } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const RATINGS = [
    { label: "Remove Rating", value: -1 },
    { label: "1: Appalling", value: 1 },
    { label: "2: Horrible", value: 2 },
    { label: "3: Very Bad", value: 3 },
    { label: "4: Bad", value: 4 },
    { label: "5: Average", value: 5 },
    { label: "6: Fine", value: 6 },
    { label: "7: Good", value: 7 },
    { label: "8: Very Good", value: 8 },
    { label: "9: Excellent", value: 9 },
    { label: "10: Masterpiece", value: 10 },
];

interface ScoreDisplayProps {
    mangaId: string;
    rating: components["schemas"]["MangaRatingResponse"];
}

async function getUserScore(mangaId: string): Promise<number | null> {
    const { data, error } = await client.GET("/v2/manga/{id}/rating", {
        params: {
            path: {
                id: mangaId,
            },
        },
    });

    if (error) {
        return null;
    }

    return data.data;
}

export default function ScoreDisplay({ mangaId, rating }: ScoreDisplayProps) {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredFill, setHoveredFill] = useState<0 | 0.5 | 1>(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [ratingLoading, setRatingLoading] = useState<boolean>(false);
    const starRefs = useRef<(Element | null)[]>([]);

    const score = useMemo(() => {
        const clampedScore = Math.max(0, Math.min(5, rating.average / 2));
        return clampedScore;
    }, [rating.average]);

    const { data: userScore } = useQuery({
        queryKey: ["user-score", mangaId],
        queryFn: () => getUserScore(mangaId),
        enabled: !!mangaId && !!user && dialogOpen,
        refetchOnMount: false,
        staleTime: Infinity,
    });

    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const isAnyHovered = hoveredIndex !== null;

    const starClasses = "size-6 md:size-7 xl:size-8";

    const handleMouseMove = (
        index: number,
        event: React.MouseEvent<Element>,
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
        event: React.MouseEvent<Element>,
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

    async function handleRemoveRating() {
        const { error } = await client.DELETE("/v2/manga/{id}/rate", {
            params: {
                path: {
                    id: mangaId,
                },
            },
        });

        if (error) {
            new Toast("Failed to remove rating. Please try again.", "error");
            return false;
        }

        new Toast("Rating removed successfully!", "success");
        queryClient.invalidateQueries({ queryKey: ["user-score", mangaId] });
        return true;
    }

    async function handleSubmitRating(rating: number) {
        setRatingLoading(true);
        if (rating === -1) {
            await handleRemoveRating();
            setRatingLoading(false);
            return;
        }

        const { error } = await client.POST("/v2/manga/{id}/rate", {
            params: {
                path: {
                    id: mangaId,
                },
            },
            body: {
                rating: rating,
            },
        });
        setRatingLoading(false);

        if (error) {
            new Toast("Failed to submit rating. Please try again.", "error");
            return;
        }

        new Toast("Rating submitted successfully!", "success");
        queryClient.invalidateQueries({ queryKey: ["user-score", mangaId] });
    }

    return (
        <div className="flex w-full h-full bg-primary/10 rounded-xl flex flex-col items-center justify-center p-2 xl:p-4">
            <div className="flex flex-col items-center justify-center relative top-1 xl:top-2.5">
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
                                onClick={() => {
                                    if (!user) return;

                                    const rating =
                                        hoveredIndex !== null
                                            ? hoveredIndex + hoveredFill
                                            : 0;
                                    setSelectedRating(rating * 2); // Convert to 10-point scale
                                    setDialogOpen(true);
                                }}
                            >
                                {/* Background layer */}
                                <Star
                                    className={cn(
                                        "absolute inset-0 z-10",
                                        starClasses,
                                        "text-primary/20",
                                    )}
                                />
                                {/* Default score overlay */}
                                <div
                                    className={cn(
                                        "absolute inset-0 z-20 transition-opacity duration-200",
                                        isAnyHovered
                                            ? "opacity-0"
                                            : "opacity-100",
                                    )}
                                >
                                    <Star
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0",
                                            index < fullStars
                                                ? "text-primary"
                                                : "text-transparent",
                                        )}
                                    />
                                    {index === fullStars && hasHalfStar && (
                                        <StarHalf
                                            className={cn(
                                                starClasses,
                                                "absolute inset-0 text-primary",
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
                                                : "opacity-0",
                                        )}
                                    />
                                    <Star
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0 text-accent-positive transition-opacity duration-200",
                                            showFull
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                    <StarHalf
                                        className={cn(
                                            starClasses,
                                            "absolute inset-0 text-accent-positive transition-opacity duration-200",
                                            showHalf
                                                ? "opacity-100"
                                                : "opacity-0",
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="gap-2 p-4">
                    <DialogHeader>
                        <DialogTitle>
                            Rate this Manga{" "}
                            {userScore && (
                                <span className="border-l pl-1">
                                    {userScore}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <ScoreGraph rating={rating} userScore={userScore} />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Select
                            value={selectedRating.toString()}
                            onValueChange={(value) =>
                                setSelectedRating(parseFloat(value))
                            }
                        >
                            <SelectTrigger className="w-full sm:w-38">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="center">
                                {RATINGS.filter(
                                    (rating) =>
                                        rating.value !== -1 ||
                                        userScore !== null,
                                ).map((rating) => (
                                    <SelectItem
                                        key={rating.value}
                                        className={cn("", {
                                            "bg-destructive/70 dark:bg-destructive/70 border border-destructive text-white hover:bg-destructive/90 dark:hover:bg-destructive/90 focus-visible:ring-destructive/20":
                                                rating.value === -1,
                                        })}
                                        value={rating.value.toString()}
                                    >
                                        {rating.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            className="flex-1"
                            onClick={async () => {
                                await handleSubmitRating(selectedRating);
                                setDialogOpen(false);
                            }}
                        >
                            {ratingLoading ? "Submitting..." : "Submit Rating"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ScoreGraph({
    rating,
    userScore,
}: {
    rating: components["schemas"]["MangaRatingResponse"];
    userScore?: number | null;
}) {
    const maxCount = useMemo(
        () => Math.max(...Object.values(rating.distribution)),
        [rating.distribution],
    );

    return (
        <div className="w-full h-40 flex flex-row gap-1 font-mono">
            {Object.entries(rating.distribution).map(([score, count]) => (
                <div
                    key={score}
                    className="flex-1 flex flex-col items-center justify-between"
                >
                    <p>{formatNumberShort(count)}</p>
                    <div
                        key={score}
                        className={cn("bg-primary w-full h-full rounded", {
                            "bg-accent-positive": userScore === parseInt(score),
                        })}
                        style={{ height: `${(count / maxCount) * 100}%` }}
                    />
                    <p>{score}</p>
                </div>
            ))}
        </div>
    );
}
