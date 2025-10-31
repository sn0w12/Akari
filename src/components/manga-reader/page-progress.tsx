"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSetting } from "@/lib/settings";

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
    const [gradient, setGradient] = useState(
        "bg-gradient-to-b from-primary/20 via-primary/30 to-accent-positive/40"
    );
    const [windowWidth, setWindowWidth] = useState(0);
    const isVisible = useSetting("showPageProgress");

    useEffect(() => {
        setWindowWidth(window.innerWidth);

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                        setGradient(
                            "bg-gradient-to-b from-primary/20 via-primary/30 to-accent-positive/40"
                        );
                    } else {
                        const left = buttonRect.left - containerRect.left;
                        setBackgroundStyle({
                            width: `${left + buttonRect.width - offset}px`,
                            height: "calc(100% - 8px)",
                        });
                        setGradient(
                            "bg-gradient-to-r from-primary/20 via-primary/30 to-accent-positive/40"
                        );
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
            className={`${
                isVisible && !hidden ? "opacity-100" : "opacity-0"
            } flex transition-opacity fixed z-50 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:top-auto`}
            style={windowWidth <= cutoff ? { bottom: "1rem" } : {}}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                ref={containerRef}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent w-full h-[30px] lg:w-9 lg:hover:w-18 lg:h-[75vh]"
            >
                <div
                    className={`absolute left-1 top-1 lg:top-1 right-1 lg:right-1 transition-[height,width] rounded-sm ${gradient}`}
                    style={backgroundStyle}
                />
                <div className="relative flex flex-row lg:flex-col h-full w-full gap-1 p-0.5">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={(e) => handleClick(index, e)}
                            className={`flex-1 transition-colors rounded-[3px] ${
                                index === currentPage
                                    ? "bg-accent-positive hover:bg-accent-positive/70"
                                    : index < currentPage
                                    ? "bg-primary hover:bg-primary/80"
                                    : "bg-primary/30 hover:bg-primary/50"
                            }`}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
