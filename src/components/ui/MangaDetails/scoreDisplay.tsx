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
    <div className="hidden w-full h-full bg-primary/10 rounded-xl shadow-lg flex flex-col items-center justify-center p-4 lg:flex">
      <div className="flex items-center justify-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="relative">
            {/* Background star in primary color */}
            <Star className="absolute w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary/25 z-10" />
            {/* Foreground star based on score */}
            {index < fullStars ? (
              <Star className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400 z-20" />
            ) : index === fullStars && hasHalfStar ? (
              <StarHalf className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400 z-20" />
            ) : (
              <Star className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary/0 z-20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
