"use client";

import { useState, useRef, useEffect } from "react";
import { cn, generateSizes } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

interface MangaCardProps {
    manga: components["schemas"]["MangaResponse"];
    expandDirection?: "left" | "right" | "auto";
    className?: string;
    priority?: boolean;
}

export function MangaCard({
    manga,
    expandDirection = "auto",
    className,
    priority = false,
}: MangaCardProps) {
    const [shouldExpand, setShouldExpand] = useState(false);
    const [computedDirection, setComputedDirection] = useState<
        "left" | "right"
    >("right");
    const [cardWidth, setCardWidth] = useState(200);
    const [cardHeight, setCardHeight] = useState(300);
    const [useFixedHeight, setUseFixedHeight] = useState(false);
    const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const innerCardRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const router = useRouter();

    useEffect(() => {
        const updateDirection = () => {
            const rect = cardRef.current?.getBoundingClientRect();
            if (rect) {
                setCardWidth(rect.width);
                setCardHeight(rect.height);

                if (expandDirection === "auto") {
                    const spaceOnRight = window.innerWidth - rect.right;
                    const expansionWidth = rect.width;

                    // If not enough space on right (with 20px padding), expand left
                    setComputedDirection(
                        spaceOnRight < expansionWidth + 20 ? "left" : "right"
                    );
                } else {
                    setComputedDirection(expandDirection);
                }
            }
        };

        updateDirection();
        window.addEventListener("resize", updateDirection);
        return () => window.removeEventListener("resize", updateDirection);
    }, [expandDirection]);

    const handleMouseEnter = () => {
        router.prefetch(`/manga/${manga.id}`);
        if (isMobile) return;

        // Clear any pending collapse timeout
        if (collapseTimeoutRef.current) {
            clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = null;
        }

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
        expandTimeoutRef.current = setTimeout(() => {
            setShouldExpand(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;

        // Clear any pending expand timeout
        if (expandTimeoutRef.current) {
            clearTimeout(expandTimeoutRef.current);
            expandTimeoutRef.current = null;
        }

        setShouldExpand(false);
        collapseTimeoutRef.current = setTimeout(() => {
            setUseFixedHeight(false);
        }, 300);
    };

    useEffect(() => {
        queueMicrotask(() => {
            setShouldExpand(false);
        });

        return () => {
            if (expandTimeoutRef.current) {
                clearTimeout(expandTimeoutRef.current);
            }
            if (collapseTimeoutRef.current) {
                clearTimeout(collapseTimeoutRef.current);
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
            {/* Cover Image - Always stays in place */}
            <div
                ref={innerCardRef}
                className="relative overflow-hidden rounded-lg bg-card shadow-lg z-10"
                style={{
                    height: useFixedHeight ? `${cardHeight}px` : undefined,
                    aspectRatio: useFixedHeight ? undefined : "2 / 3",
                }}
            >
                <Link
                    href={`/manga/${manga.id}`}
                    className="relative block h-full w-full"
                    prefetch={false}
                >
                    <Image
                        src={manga.cover}
                        alt={manga.title}
                        className="h-full w-full object-cover"
                        width={200}
                        height={300}
                        quality={60}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : "auto"}
                        preload={priority}
                        sizes={generateSizes({
                            sm: "50vw",
                            md: "33vw",
                            lg: "25vw",
                            xl: "20vw",
                            "2xl": "17vw",
                            default: "25vw",
                        })}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
            </div>

            {/* Metadata Panel - Absolutely positioned */}
            <div
                className={cn(
                    "absolute top-0 border flex h-full shrink-0 flex-col gap-3 overflow-hidden bg-card p-4 shadow-lg transition-all duration-300 ease-snappy pointer-events-none opacity-0",
                    {
                        "rounded-r-lg border-l-0": direction === "right",
                        "rounded-l-lg border-r-0": direction === "left",
                        "opacity-100": shouldExpand,
                    }
                )}
                style={
                    {
                        "--card-padding": "calc(var(--spacing) * 4)",
                        width: `${cardWidth}px`,
                        [direction === "left" ? "right" : "left"]:
                            "calc(100% - var(--card-padding))",
                        transform: shouldExpand
                            ? "translateX(0)"
                            : direction === "left"
                            ? "translateX(20px)"
                            : "translateX(-20px)",
                    } as React.CSSProperties
                }
            >
                <div
                    className={cn("space-y-2", {
                        "pl-4": direction === "right",
                        "pr-4": direction === "left",
                    })}
                >
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
    );
}
