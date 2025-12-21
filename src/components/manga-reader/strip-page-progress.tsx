"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSetting } from "@/lib/settings";

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
    const [backgroundStyle, setBackgroundStyle] = useState({});
    const [gradient, setGradient] = useState(
        "bg-gradient-to-b from-primary/20 via-primary/30 to-accent-positive/40"
    );
    const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
    const isVisible = useSetting("showPageProgress");

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const updateBackgroundStyle = () => {
            const isVertical = windowWidth >= cutoff;

            if (isVertical) {
                setBackgroundStyle({
                    height: `${progress * 100}%`,
                    width: "calc(100% - 8px)",
                });
                setGradient(
                    "bg-gradient-to-b from-primary/20 via-primary/30 to-accent-positive/40"
                );
            } else {
                setBackgroundStyle({
                    width: `${progress * 100}%`,
                    height: "calc(100% - 8px)",
                });
                setGradient(
                    "bg-gradient-to-r from-primary/20 via-primary/30 to-accent-positive/40"
                );
            }
        };

        updateBackgroundStyle();
        window.addEventListener("resize", updateBackgroundStyle);
        return () =>
            window.removeEventListener("resize", updateBackgroundStyle);
    }, [progress, windowWidth]);

    return (
        <div
            className={`${
                isVisible && !hidden ? "opacity-100" : "opacity-0"
            } flex transition-opacity fixed z-50 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:top-auto`}
            style={windowWidth <= cutoff ? { bottom: "1rem" } : {}}
        >
            <div
                ref={containerRef}
                className="transition-[width] relative p-1 rounded-lg border border-primary/30 bg-transparent h-7.5 lg:w-9 lg:h-[75vh]"
                style={windowWidth < 768 ? { width: "calc(100% - 118px)" } : {}}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`absolute left-1 top-1 lg:top-1 right-1 lg:right-1 transition-[height,width] rounded-sm ${gradient}`}
                    style={backgroundStyle}
                />
            </div>
        </div>
    );
}
