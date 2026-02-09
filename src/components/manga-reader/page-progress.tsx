"use client";

import { useWindowWidth } from "@/hooks/use-window-width";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

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

    useEffect(() => {
        const updateBackgroundStyle = () => {
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
                            const right =
                                containerRect.right - buttonRect.right;
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
        };

        updateBackgroundStyle();
        window.addEventListener("resize", updateBackgroundStyle);
        return () =>
            window.removeEventListener("resize", updateBackgroundStyle);
    }, [currentPage, readingDir, totalPages, windowWidth]);

    return (
        <div
            className={cn(
                "flex transition-opacity fixed z-50 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-7 lg:top-auto",
                {
                    "opacity-100": isVisible && !hidden,
                    "opacity-0 pointer-events-none": !isVisible || hidden,
                },
            )}
            style={
                windowWidth <= cutoff
                    ? {
                          width: "calc(100% - 118px)",
                          bottom: "calc(calc(var(--spacing) * 16) + var(--safe-bottom))",
                      }
                    : {}
            }
        >
            <div
                ref={containerRef}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent h-7.5 w-full lg:w-9 lg:hover:w-18 lg:h-[80vh]"
                onClick={(e) => e.stopPropagation()}
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
                        "relative flex lg:flex-col h-full w-full gap-0 md:gap-1 p-0.5",
                        readingDir === "rtl" ? "flex-row-reverse" : "flex-row",
                    )}
                >
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={(e) => handleClick(index, e)}
                            className={cn(
                                "flex-1 transition-colors md:rounded-[3px] md:first:rounded-[3px] md:last:rounded-[3px]",
                                {
                                    "bg-accent-positive hover:bg-accent-positive/70":
                                        index === currentPage,
                                    "bg-primary hover:bg-primary/80":
                                        index < currentPage,
                                    "bg-primary/30 hover:bg-primary/50":
                                        index > currentPage,
                                    "first:rounded-l-sm last:rounded-r-sm":
                                        readingDir === "ltr",
                                    "first:rounded-r-sm last:rounded-l-sm":
                                        readingDir === "rtl",
                                },
                            )}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
