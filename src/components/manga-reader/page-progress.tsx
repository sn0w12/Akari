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
    const gradient =
        "from-primary/20 via-primary/30 to-accent-positive/40 bg-gradient-to-r lg:bg-gradient-to-b";

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
                        const left = buttonRect.left - containerRect.left;
                        setBackgroundStyle({
                            width: `${left + buttonRect.width - offset}px`,
                            height: "calc(100% - 8px)",
                        });
                    }
                }
            }
        };

        updateBackgroundStyle();
        window.addEventListener("resize", updateBackgroundStyle);
        return () =>
            window.removeEventListener("resize", updateBackgroundStyle);
    }, [currentPage, totalPages, windowWidth]);

    return (
        <div
            className={cn(
                "flex transition-opacity fixed z-50 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:top-auto",
                {
                    "opacity-100": isVisible && !hidden,
                    "opacity-0 pointer-events-none": !isVisible || hidden,
                },
            )}
            style={windowWidth <= cutoff ? { bottom: "1rem" } : {}}
        >
            <div
                ref={containerRef}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent h-7.5 lg:w-9 lg:hover:w-18 lg:h-[75vh]"
                style={windowWidth < 768 ? { width: "calc(100% - 118px)" } : {}}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={cn(
                        "absolute left-1 top-1 lg:top-1 right-1 lg:right-1 transition-[height,width] rounded-l-md md:rounded-[3px]",
                        gradient,
                        {
                            "rounded-r-md": currentPage === totalPages - 1,
                        },
                    )}
                    style={backgroundStyle}
                />
                <div className="relative flex flex-row lg:flex-col h-full w-full gap-0 md:gap-1 p-0.5">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={(e) => handleClick(index, e)}
                            className={cn(
                                "flex-1 transition-colors first:rounded-l-sm last:rounded-r-sm md:rounded-[3px] md:first:rounded-[3px] md:last:rounded-[3px]",
                                {
                                    "bg-accent-positive hover:bg-accent-positive/70":
                                        index === currentPage,
                                    "bg-primary hover:bg-primary/80":
                                        index < currentPage,
                                    "bg-primary/30 hover:bg-primary/50":
                                        index > currentPage,
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
