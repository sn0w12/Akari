import { useWindowWidth } from "@/hooks/use-window-width";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "../ui/sidebar";
import { READER_BOTTOM_OFFSET } from "./chapter-info";

interface PageProgressProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    hidden?: boolean;
}

const cutoff = 1024;

export default function PageProgress({
    currentPage,
    totalPages,
    setCurrentPage,
    hidden = false,
}: PageProgressProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [backgroundStyle, setBackgroundStyle] = useState({});
    const { open } = useSidebar();
    const windowWidth = useWindowWidth();
    const isVisible = useSetting("showPageProgress");
    const readingDir = useSetting("readingDirection");
    const gradient =
        readingDir === "rtl"
            ? "from-primary/20 via-primary/30 to-accent-positive/40 bg-gradient-to-l lg:bg-gradient-to-b"
            : "from-primary/20 via-primary/30 to-accent-positive/40 bg-gradient-to-r lg:bg-gradient-to-b";

    const handleClick = (page: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPage(page);
    };

    const updateBackgroundStyle = useCallback(() => {
        if (containerRef.current) {
            const offset = 3;
            const isVertical = windowWidth >= cutoff;
            const buttons = containerRef.current.querySelectorAll("button");
            const targetButton = buttons[currentPage];

            if (targetButton) {
                const containerRect =
                    containerRef.current.getBoundingClientRect();
                const buttonRect = targetButton.getBoundingClientRect();

                if (isVertical) {
                    const top = buttonRect.top - containerRect.top;
                    setBackgroundStyle({
                        height: `${top + buttonRect.height - offset}px`,
                        width: "calc(100% - 8px)",
                    });
                } else {
                    if (readingDir === "rtl") {
                        const right = containerRect.right - buttonRect.right;
                        setBackgroundStyle({
                            width: `${right + buttonRect.width - offset}px`,
                            height: "calc(100% - 8px)",
                            left: "auto",
                            right: "4px",
                        });
                    } else {
                        const left = buttonRect.left - containerRect.left;
                        setBackgroundStyle({
                            width: `${left + buttonRect.width - offset}px`,
                            height: "calc(100% - 8px)",
                            left: "4px",
                            right: "auto",
                        });
                    }
                }
            }
        }
    }, [currentPage, readingDir, windowWidth]);

    const backgroundStyleRef = useRef(updateBackgroundStyle);
    useEffect(() => {
        backgroundStyleRef.current = updateBackgroundStyle;
    });

    useEffect(() => {
        updateBackgroundStyle();
        const handler = () => backgroundStyleRef.current();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [updateBackgroundStyle]);

    return (
        <div
            className={cn(
                "flex transition-[opacity,left] ease-snappy fixed z-50 left-4 lg:bottom-4 lg:top-auto",
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
                          width: "calc(100% - 118px)",
                          bottom: READER_BOTTOM_OFFSET,
                      }
                    : {}
            }
        >
            <div
                ref={containerRef}
                role="button"
                tabIndex={0}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent h-7.5 w-full lg:w-9 lg:hover:w-18 lg:h-[80vh]"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                    }
                }}
            >
                <div
                    className={cn(
                        "absolute top-1 lg:top-1 transition-[height,width] md:rounded-[3px]",
                        readingDir === "rtl"
                            ? "right-1 lg:right-1 rounded-r-md"
                            : "left-1 rounded-l-md",
                        gradient,
                        {
                            [readingDir === "rtl"
                                ? "rounded-l-md"
                                : "rounded-r-md"]:
                                currentPage === totalPages - 1,
                        },
                    )}
                    style={backgroundStyle}
                />
                <div
                    className={cn(
                        "relative flex lg:flex-col h-full w-full gap-0 p-0.5",
                        readingDir === "rtl" ? "flex-row-reverse" : "flex-row",
                        {
                            "md:gap-1": totalPages <= 100,
                        },
                    )}
                >
                    {Array.from({ length: totalPages }).map((_, pageIdx) => (
                        <button
                            key={`page-${pageIdx}`}
                            onClick={(e) => handleClick(pageIdx, e)}
                            className={cn("flex-1 transition-colors", {
                                "bg-accent-positive hover:bg-accent-positive/70":
                                    pageIdx === currentPage,
                                "bg-primary hover:bg-primary/80":
                                    pageIdx < currentPage,
                                "bg-primary/30 hover:bg-primary/50":
                                    pageIdx > currentPage,
                                "first:rounded-l-sm last:rounded-r-sm":
                                    readingDir === "ltr" && totalPages <= 100,
                                "first:rounded-r-sm last:rounded-l-sm":
                                    readingDir === "rtl" && totalPages <= 100,
                                "md:first:rounded-t-[3px] md:last:rounded-b-[3px]":
                                    totalPages > 100,
                                "md:rounded-[3px] md:first:rounded-[3px] md:last:rounded-[3px]":
                                    totalPages <= 100,
                            })}
                            aria-label={`Go to page ${pageIdx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
