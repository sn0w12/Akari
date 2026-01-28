"use client";

import { useWindowWidth } from "@/hooks/use-window-width";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

interface PageProgressProps {
    progress: number;
    hidden?: boolean;
}

const cutoff = 1024;

export default function StripPageProgress({
    progress,
    hidden = false,
}: PageProgressProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gradient =
        "from-primary/20 via-primary/30 to-accent-positive/40 bg-gradient-to-r lg:bg-gradient-to-b";
    const isVisible = useSetting("showPageProgress");
    const windowWidth = useWindowWidth();

    return (
        <div
            className={cn(
                "flex transition-opacity fixed z-50 left-4 right-4 lg:left-auto lg:right-4 lg:top-auto w-[calc(100%-118px)] lg:w-9",
                {
                    "opacity-100": isVisible && !hidden,
                    "opacity-0 pointer-events-none": !isVisible || hidden,
                },
            )}
            style={
                windowWidth <= cutoff
                    ? {
                          bottom: "calc(calc(var(--spacing) * 16) + env(safe-area-inset-bottom))",
                      }
                    : {}
            }
        >
            <div
                ref={containerRef}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent h-7.5 w-full lg:w-9 lg:h-[75vh]"
                style={
                    {
                        "--progress": `${progress * 100}%`,
                    } as React.CSSProperties
                }
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={cn(
                        "absolute left-1 top-1 lg:top-1 right-1 lg:right-1 transition-[height,width] rounded-sm progress-bar",
                        gradient,
                    )}
                />
            </div>
        </div>
    );
}
