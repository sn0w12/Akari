import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalPanel,
  ResponsiveModalPopup,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { client } from "@/lib/api";
import { toastManager } from "@/components/ui/toast";
import { cn, formatNumberShort } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";

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
      toastManager.add({
        title: "Failed to remove rating. Please try again.",
        type: "error",
      });
      return false;
    }

    toastManager.add({
      title: "Rating removed successfully!",
      type: "success",
    });
    void queryClient.invalidateQueries({
      queryKey: ["user-score", mangaId],
    });
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
      toastManager.add({
        title: "Failed to submit rating. Please try again.",
        type: "error",
      });
      return;
    }

    toastManager.add({
      title: "Rating submitted successfully!",
      type: "success",
    });
    void queryClient.invalidateQueries({
      queryKey: ["user-score", mangaId],
    });
    onOpenChange(false);
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalPopup>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            Rate this Manga {userScore && <span className="border-l pl-1">{userScore}</span>}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalPanel>
          <ScoreGraph rating={rating} userScore={userScore} />
        </ResponsiveModalPanel>
        <ResponsiveModalFooter className="flex-col">
          <Select
            items={RATINGS}
            value={selectedRating}
            onValueChange={(value) => {
              if (!value) return;
              setSelectedRating(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-38">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="center">
              {RATINGS.reduce<React.ReactNode[]>((acc, rating) => {
                if (rating.value !== -1 || userScore !== null) {
                  acc.push(
                    <SelectItem
                      key={rating.value}
                      className={cn("", {
                        "bg-destructive/70 dark:bg-destructive/70 border border-destructive text-white hover:bg-destructive/90 dark:hover:bg-destructive/90 focus-visible:ring-destructive/20":
                          rating.value === -1,
                      })}
                      value={rating.value}
                    >
                      {rating.label}
                    </SelectItem>,
                  );
                }
                return acc;
              }, [])}
            </SelectContent>
          </Select>
          <Button
            onClick={async () => {
              await handleSubmitRating(selectedRating);
            }}
          >
            Submit Rating
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalPopup>
    </ResponsiveModal>
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
        <div key={score} className="flex-1 flex flex-col items-center justify-between">
          {formatNumberShort(count)}
          <div className="w-full flex-1 relative">
            <div
              className={cn("bg-primary w-full rounded absolute bottom-0", {
                "bg-accent-positive": userScore === parseInt(score),
              })}
              style={{ height: `${(count / maxCount) * 100}%` }}
            />
          </div>
          {score}
        </div>
      ))}
    </div>
  );
}
