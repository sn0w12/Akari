import { Image } from "@/components/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { sortGenresByCategory } from "@/lib/api/search";
import { cn } from "@/lib/utils";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { Link } from "@tanstack/react-router";
import { useEffect, useReducer, useRef } from "react";
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

type ExpandState = {
    shouldExpand: boolean;
    computedDirection: "left" | "right";
    cardWidth: number;
    cardHeight: number;
    useFixedHeight: boolean;
};

type ExpandAction =
    | { type: "SHOULD_EXPAND"; value: boolean }
    | { type: "COMPUTED_DIRECTION"; direction: "left" | "right" }
    | { type: "DIMENSIONS"; width: number; height: number }
    | { type: "USE_FIXED_HEIGHT"; value: boolean };

function expandReducer(state: ExpandState, action: ExpandAction): ExpandState {
    switch (action.type) {
        case "SHOULD_EXPAND":
            return { ...state, shouldExpand: action.value };
        case "COMPUTED_DIRECTION":
            return { ...state, computedDirection: action.direction };
        case "DIMENSIONS":
            return {
                ...state,
                cardWidth: action.width,
                cardHeight: action.height,
            };
        case "USE_FIXED_HEIGHT":
            return { ...state, useFixedHeight: action.value };
    }
}

const INITIAL_EXPAND_STATE: ExpandState = {
    shouldExpand: false,
    computedDirection: "right",
    cardWidth: 200,
    cardHeight: 300,
    useFixedHeight: false,
};

export function MangaCard({
    manga,
    expandDirection = "auto",
    className,
    priority = false,
}: MangaCardProps) {
    const sortedGenres = sortGenresByCategory(manga.genres);

    const [expandState, dispatch] = useReducer(
        expandReducer,
        INITIAL_EXPAND_STATE,
    );
    const {
        shouldExpand,
        computedDirection,
        cardWidth,
        cardHeight,
        useFixedHeight,
    } = expandState;
    const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const innerCardRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const updateDirectionCallback = () => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) {
            dispatch({
                type: "DIMENSIONS",
                width: rect.width,
                height: rect.height,
            });

            if (expandDirection === "auto") {
                const spaceOnRight = window.innerWidth - rect.right;
                const expansionWidth = rect.width;

                dispatch({
                    type: "COMPUTED_DIRECTION",
                    direction:
                        spaceOnRight < expansionWidth + 20 ? "left" : "right",
                });
            } else {
                dispatch({
                    type: "COMPUTED_DIRECTION",
                    direction: expandDirection,
                });
            }
        }
    };

    const updateDirection = useThrottledCallback(updateDirectionCallback, {
        wait: 1000,
    });

    const updateDirectionRef = useRef(updateDirection);
    useEffect(() => {
        updateDirectionRef.current = updateDirection;
    });

    useEffect(() => {
        const handler = () => updateDirectionRef.current();
        handler();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [expandDirection]);

    const handleMouseEnter = () => {
        if (isMobile) return;

        // Clear any pending collapse timeout
        if (collapseTimeoutRef.current) {
            clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = null;
        }

        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            dispatch({
                type: "DIMENSIONS",
                width: rect.width,
                height: rect.height,
            });

            if (expandDirection === "auto") {
                const spaceOnRight = window.innerWidth - rect.right;
                const expansionWidth = rect.width;
                dispatch({
                    type: "COMPUTED_DIRECTION",
                    direction:
                        spaceOnRight < expansionWidth + 20 ? "left" : "right",
                });
            }
        }

        dispatch({ type: "USE_FIXED_HEIGHT", value: true });
        expandTimeoutRef.current = setTimeout(() => {
            dispatch({ type: "SHOULD_EXPAND", value: true });
        }, 300);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;

        // Clear any pending expand timeout
        if (expandTimeoutRef.current) {
            clearTimeout(expandTimeoutRef.current);
            expandTimeoutRef.current = null;
        }

        dispatch({ type: "SHOULD_EXPAND", value: false });
        collapseTimeoutRef.current = setTimeout(() => {
            dispatch({ type: "USE_FIXED_HEIGHT", value: false });
        }, 300);
    };

    useEffect(() => {
        queueMicrotask(() => {
            dispatch({ type: "SHOULD_EXPAND", value: false });
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
                    to="/manga/$mangaId"
                    params={{ mangaId: manga.id }}
                    className="relative block h-full w-full"
                >
                    <Image
                        src={manga.cover.url}
                        thumbHash={manga.cover.thumbhash}
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
                            {[...new Set(manga.authors)].map((author) => (
                                <Badge key={`${manga.id}-${author}`}>
                                    {author}
                                </Badge>
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
                            {sortedGenres.slice(0, 6).map((genre) => (
                                <GenreBadge
                                    key={`${manga.id}-${genre}`}
                                    genre={genre}
                                />
                            ))}
                            {sortedGenres.length > 6 && (
                                <GenreBadge
                                    genre={`+${sortedGenres.length - 6}`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
