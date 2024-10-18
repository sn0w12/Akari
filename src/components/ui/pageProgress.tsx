import React, { useEffect, useRef, useState } from "react";

interface PageProgressProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

const cutoff = 1024;

export default function PageProgress({
    currentPage,
    totalPages,
    setCurrentPage,
}: PageProgressProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [backgroundStyle, setBackgroundStyle] = useState({});

    const handleClick = (page: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentPage(page);
    };

    useEffect(() => {
        const updateBackgroundStyle = () => {
            if (containerRef.current) {
                const offset = 3;
                const isVertical = window.innerWidth >= cutoff;
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
    }, [currentPage, totalPages]);

    return (
        <div
            className={`fixed z-50 left-4 right-4 lg:bottom-auto lg:left-auto lg:right-4 lg:top-1/2 lg:-translate-y-1/2`}
            style={
                window.innerWidth <= cutoff
                    ? { bottom: window.innerWidth <= 650 ? "12rem" : "8rem" }
                    : {}
            }
            onClick={(e) => e.stopPropagation()}
        >
            <div
                ref={containerRef}
                className="relative p-1 rounded-lg border border-primary/30 bg-background w-full lg:w-[30px] h-[30px] lg:h-[80vh]"
            >
                <div
                    className="absolute left-1 top-1 lg:top-1 right-1 lg:right-1 bg-primary/20 transition-all duration-300 ease-in-out rounded-md"
                    style={backgroundStyle}
                />
                <div className="relative flex flex-row lg:flex-col h-full w-full gap-1 p-0.5">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={(e) => handleClick(index, e)}
                            className={`flex-1 transition-all duration-300 ease-in-out rounded-sm ${
                                index <= currentPage
                                    ? "bg-primary"
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
