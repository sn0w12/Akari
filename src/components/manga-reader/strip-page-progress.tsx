import { useWindowWidth } from "@/hooks/use-window-width";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { useSidebar } from "../ui/sidebar";
import { READER_BOTTOM_OFFSET } from "./chapter-info";

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
    const { open } = useSidebar();
    const isVisible = useSetting("showPageProgress");
    const windowWidth = useWindowWidth();

    return (
        <div
            className={cn(
                "flex transition-[opacity,left] ease-snappy fixed z-50 left-4 lg:bottom-4 lg:top-auto w-[calc(100%-118px)] lg:w-9",
                {
                    "opacity-100": isVisible && !hidden,
                    "opacity-0 pointer-events-none": !isVisible || hidden,
                    "lg:left-16": !open,
                    "lg:left-68": open,
                },
            )}
            style={
                windowWidth <= cutoff
                    ? {
                          bottom: READER_BOTTOM_OFFSET,
                      }
                    : {}
            }
        >
            <div
                ref={containerRef}
                role="button"
                tabIndex={0}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent h-7.5 w-full lg:w-9 lg:h-[80vh]"
                style={
                    {
                        "--progress": `${progress * 100}%`,
                    } as React.CSSProperties
                }
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                    }
                }}
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
