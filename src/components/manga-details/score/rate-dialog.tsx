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
import { useMemo, useState } from "react";

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

interface RateDialogProps {
    mangaId: string;
    rating: components["schemas"]["MangaRatingResponse"];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialRating: number;
}

export function RateDialog({
    mangaId,
    rating,
    open,
    onOpenChange,
    initialRating,
}: RateDialogProps) {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [selectedRating, setSelectedRating] = useState<number>(initialRating);

    const { data: userScore } = useQuery({
        queryKey: ["user-score", mangaId],
        queryFn: () => getUserScore(mangaId),
        enabled: !!mangaId && !!user && open,
        refetchOnMount: false,
        staleTime: Infinity,
    });

    async function handleRemoveRating() {
        const { error } = await client.DELETE("/v2/manga/{id}/rate", {
            params: { path: { id: mangaId } },
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
        if (rating === -1) {
            await handleRemoveRating();
            onOpenChange(false);
            return;
        }

        const { error } = await client.POST("/v2/manga/{id}/rate", {
            params: { path: { id: mangaId } },
            body: { rating },
        });

        if (error) {
            new Toast("Failed to submit rating. Please try again.", "error");
            return;
        }

        new Toast("Rating submitted successfully!", "success");
        queryClient.invalidateQueries({ queryKey: ["user-score", mangaId] });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-2 p-4">
                <DialogHeader>
                    <DialogTitle>
                        Rate this Manga{" "}
                        {userScore && (
                            <span className="border-l pl-1">{userScore}</span>
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
                                    rating.value !== -1 || userScore !== null,
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
                        }}
                    >
                        Submit Rating
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
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
