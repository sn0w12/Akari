"use client";

import React from "react";
import { Star, StarHalf } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  const clampedScore = Math.max(0, Math.min(5, score));
  const fullStars = Math.floor(clampedScore);
  const hasHalfStar = clampedScore % 1 >= 0.5;

  return (
    <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 rounded-xl shadow-lg flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <React.Fragment key={index}>
            {index < fullStars ? (
              <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
            ) : index === fullStars && hasHalfStar ? (
              <StarHalf className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
            ) : (
              <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary/30" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
