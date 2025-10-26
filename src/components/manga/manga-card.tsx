"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface MangaCardProps {
    manga: components["schemas"]["MangaResponse"];
    expandDirection?: "left" | "right" | "auto";
    className?: string;
}

export function MangaCard({
    manga,
    expandDirection = "auto",
    className,
}: MangaCardProps) {
    const [shouldExpand, setShouldExpand] = useState(false);
    const [computedDirection, setComputedDirection] = useState<
        "left" | "right"
    >("right");
    const [cardWidth, setCardWidth] = useState(200);
    const [cardHeight, setCardHeight] = useState(300);
    const [useFixedHeight, setUseFixedHeight] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const innerCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (expandDirection === "auto" && cardRef.current) {
            const updateDirection = () => {
                const rect = cardRef.current?.getBoundingClientRect();
                if (rect) {
                    setCardWidth(rect.width);
                    setCardHeight(rect.height);

                    const spaceOnRight = window.innerWidth - rect.right;
                    const expansionWidth = rect.width;

                    // If not enough space on right (with 20px padding), expand left
                    setComputedDirection(
                        spaceOnRight < expansionWidth + 20 ? "left" : "right"
                    );
                }
            };

            updateDirection();
            window.addEventListener("resize", updateDirection);
            return () => window.removeEventListener("resize", updateDirection);
        } else if (expandDirection !== "auto") {
            setComputedDirection(expandDirection);
        }
    }, [expandDirection]);

    const handleMouseEnter = () => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setCardWidth(rect.width);
            setCardHeight(rect.height);

            if (expandDirection === "auto") {
                const spaceOnRight = window.innerWidth - rect.right;
                const expansionWidth = rect.width;
                setComputedDirection(
                    spaceOnRight < expansionWidth + 20 ? "left" : "right"
                );
            }
        }

        setUseFixedHeight(true);
        timeoutRef.current = setTimeout(() => {
            setShouldExpand(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShouldExpand(false);
        setTimeout(() => {
            setUseFixedHeight(false);
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const direction = computedDirection;

    return (
        <div
            ref={cardRef}
            className={cn(
                "group relative transition-all duration-300 ease-snappy",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                zIndex: shouldExpand ? 50 : 1,
            }}
        >
            <div
                ref={innerCardRef}
                className={cn(
                    "relative flex overflow-hidden rounded-lg bg-card shadow-lg transition-all duration-300 ease-snappy",
                    direction === "left" && "flex-row-reverse"
                )}
                style={{
                    width: shouldExpand ? `${cardWidth * 2}px` : "100%",
                    height: useFixedHeight ? `${cardHeight}px` : undefined,
                    aspectRatio: useFixedHeight ? undefined : "2 / 3",
                    transform:
                        shouldExpand && direction === "left"
                            ? `translateX(-${cardWidth}px)`
                            : "translateX(0)",
                }}
            >
                {/* Cover Image */}
                <Link
                    href={`/manga/${manga.id}`}
                    className="relative h-full shrink-0"
                    style={{ width: `${cardWidth}px` }}
                >
                    <Image
                        src={manga.cover || "/placeholder.svg"}
                        alt={manga.title}
                        className="h-full w-full object-cover"
                        width={200}
                        height={300}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>

                {/* Metadata Panel - Fixed width to prevent content wrapping during animation */}
                <div
                    className={cn(
                        "flex shrink-0 flex-col gap-3 bg-card p-4 transition-opacity duration-300",
                        shouldExpand
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                    )}
                    style={{ width: `${cardWidth}px` }}
                >
                    <div className="space-y-2">
                        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-card-foreground border-b pb-1">
                            {manga.title}
                        </h3>

                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Authors
                            </p>
                            <p className="line-clamp-1 text-sm text-foreground">
                                {manga.authors.join(", ")}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Status
                            </p>
                            <p className="text-sm capitalize text-foreground">
                                {manga.status}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Type
                            </p>
                            <p className="text-sm capitalize text-foreground">
                                {manga.type}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Genres
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {manga.genres.slice(0, 6).map((genre) => (
                                    <span
                                        key={genre}
                                        className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                                    >
                                        {genre}
                                    </span>
                                ))}
                                {manga.genres.length > 6 && (
                                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                        +{manga.genres.length - 6}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
