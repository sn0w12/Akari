import { Image } from "@/components/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GenreBadge } from "../manga-details/badges/genre";
import { StatusBadge } from "../manga-details/badges/status";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface MangaCardProps {
    manga: components["schemas"]["MangaResponse"];
    expandDirection?: "left" | "right" | "auto";
    className?: string;
    priority?: boolean;
}

export const MANGA_CARD_IMG_OPTS = {
    sizes: {
        default: "128px",
        sm: 96,
        lg: 240,
    },
    quality: 40,
} as const;

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

    const updateDirectionCallback = () => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) {
            setCardWidth(rect.width);
            setCardHeight(rect.height);

            if (expandDirection === "auto") {
                const spaceOnRight = window.innerWidth - rect.right;
                const expansionWidth = rect.width;

                // If not enough space on right (with 20px padding), expand left
                setComputedDirection(
                    spaceOnRight < expansionWidth + 20 ? "left" : "right",
                );
            } else {
                setComputedDirection(expandDirection);
            }
        }
    };

    const updateDirection = useThrottledCallback(updateDirectionCallback, {
        wait: 1000,
    });

    useEffect(() => {
        updateDirection();
        window.addEventListener("resize", updateDirection);
        return () => window.removeEventListener("resize", updateDirection);
    }, [updateDirection]);

    const handleMouseEnter = () => {
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
                    spaceOnRight < expansionWidth + 20 ? "left" : "right",
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
                className,
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
                className="relative overflow-hidden rounded-2xl bg-card shadow-lg z-10"
                style={{
                    height: useFixedHeight ? `${cardHeight}px` : undefined,
                    aspectRatio: useFixedHeight ? undefined : "2 / 3",
                }}
            >
                <Link
                    to="/manga/$id"
                    params={{ id: manga.id }}
                    className="relative block h-full w-full"
                >
                    <Image
                        src={manga.cover}
                        alt={manga.title}
                        className="h-full w-full object-cover"
                        width={200}
                        height={300}
                        fetchPriority={priority ? "high" : "auto"}
                        decoding="async"
                        sizes={MANGA_CARD_IMG_OPTS.sizes}
                        quality={MANGA_CARD_IMG_OPTS.quality}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
            </div>

            {/* Metadata Panel - Absolutely positioned */}
            <Card
                className={cn(
                    "absolute top-0 flex h-full shrink-0 flex-col gap-3 overflow-hidden p-4 transition-all duration-300 ease-snappy pointer-events-none opacity-0",
                    {
                        "border-l-0": direction === "right",
                        "border-r-0": direction === "left",
                        "opacity-100": shouldExpand,
                    },
                )}
                style={
                    {
                        "--card-padding": "calc(var(--spacing) * 6)",
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
                        <div className="flex flex-wrap gap-1">
                            {manga.authors.map((author) => (
                                <Badge key={author}>{author}</Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Status
                        </p>
                        <StatusBadge status={manga.status} />
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Type
                        </p>
                        <Badge>{manga.type}</Badge>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Genres
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {manga.genres.slice(0, 6).map((genre) => (
                                <GenreBadge key={genre} genre={genre} />
                            ))}
                            {manga.genres.length > 6 && (
                                <GenreBadge
                                    genre={`+${manga.genres.length - 6}`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
