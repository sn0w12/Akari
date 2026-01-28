"use client";

import { useDevice } from "@/contexts/device-context";
import { useBodyScrollListener } from "@/hooks/use-body-scroll-listener";
import { cn } from "@/lib/utils";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { ArrowDown } from "lucide-react";
import React, {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Spinner from "./ui/puff-loader";

export interface PullToRefreshProps {
    children: ReactNode;
    onRefresh?: () => Promise<void> | void;
    enabled?: boolean;
    threshold?: number;
    maxPull?: number;
    minRefreshTime?: number;
    className?: string;
    style?: CSSProperties;
    indicatorClassName?: string;
    pullText?: string;
    releaseText?: string;
    refreshingText?: string;
    as?: "div" | "main" | "section";
    id?: string;
}

interface TouchPoint {
    y: number;
}

const DEFAULT_THRESHOLD: number = 80;
const DEFAULT_MAX_PULL: number = 300;
const CAN_PULL_DELAY_MS: number = 750;

export function PullToRefresh({
    children,
    onRefresh,
    enabled,
    threshold = DEFAULT_THRESHOLD,
    maxPull = DEFAULT_MAX_PULL,
    minRefreshTime = 1000,
    className,
    style,
    indicatorClassName,
    pullText = "Pull to refresh",
    releaseText = "Release to refresh",
    refreshingText = "",
    as = "div",
    id,
}: PullToRefreshProps) {
    const { isPWA, deviceType } = useDevice();
    const isEnabled: boolean = enabled ?? (isPWA && deviceType !== "desktop");
    const containerRef = useRef<HTMLElement | null>(null);
    const startRef = useRef<TouchPoint | null>(null);

    const [pullDistance, setPullDistance] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isAtTop, setIsAtTop] = useState<boolean>(true);
    const [canPull, setCanPull] = useState<boolean>(false);
    const pullTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleScroll = useThrottledCallback(
        (element: HTMLElement) => {
            setIsAtTop(element.scrollTop < 20);
        },
        {
            wait: 50,
        },
    );
    useBodyScrollListener(
        handleScroll,
        {
            passive: true,
        },
        isEnabled,
    );

    useEffect(() => {
        if (isAtTop) {
            pullTimeoutRef.current = setTimeout(
                () => setCanPull(true),
                CAN_PULL_DELAY_MS,
            );
        } else {
            if (pullTimeoutRef.current) {
                clearTimeout(pullTimeoutRef.current);
                pullTimeoutRef.current = null;
            }
            setCanPull(false);
        }
        return () => {
            if (pullTimeoutRef.current) {
                clearTimeout(pullTimeoutRef.current);
            }
        };
    }, [isAtTop]);

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.style.overscrollBehavior =
            isEnabled && isAtTop && canPull ? "none" : "auto";
    }, [isEnabled, isAtTop, canPull]);

    const progress: number = useMemo(
        () => Math.min(pullDistance / threshold, 1),
        [pullDistance, threshold],
    );

    const contentStyle: CSSProperties = useMemo(
        () => ({
            ...style,
            transform:
                pullDistance > 0
                    ? `translate3d(0, ${pullDistance}px, 0)`
                    : undefined,
            transition: isDragging ? "none" : "transform 200ms ease-out",
        }),
        [pullDistance, isDragging, style],
    );

    const handleTouchStart = useCallback(
        (event: React.TouchEvent<HTMLElement>): void => {
            if (!isEnabled || isRefreshing || !canPull || !isAtTop) return;

            // Prevent pull-to-refresh when a modal or overlay is open (e.g., Radix focus guard)
            if (
                typeof document !== "undefined" &&
                document.querySelector("[data-radix-focus-guard]")
            )
                return;

            const container = containerRef.current;
            if (!container) return;

            const touch = event.touches[0];
            startRef.current = { y: touch.clientY };
            setIsDragging(true);
        },
        [isEnabled, isRefreshing, canPull, isAtTop],
    );

    const handleTouchMove = useCallback(
        (event: React.TouchEvent<HTMLElement>): void => {
            if (!isEnabled || isRefreshing || !isDragging || !canPull) return;

            // Prevent pull-to-refresh when a modal or overlay is open (e.g., Radix focus guard)
            if (
                typeof document !== "undefined" &&
                document.querySelector("[data-radix-focus-guard]")
            )
                return;

            if (!isAtTop) {
                setIsDragging(false);
                setPullDistance(0);
                return;
            }
            const start = startRef.current;
            if (!start) return;

            const touch = event.touches[0];
            const delta = touch.clientY - start.y;

            if (delta > 0) {
                event.preventDefault();
                // Apply non-linear damping to make pull feel more natural
                const dampedDelta = Math.pow(delta, 0.8);
                setPullDistance(Math.min(dampedDelta, maxPull));
            } else if (delta > -20) {
                // Small tolerance for finger slips, keep current pull distance
                event.preventDefault();
            } else {
                // Significant upward drag, reset pull
                setPullDistance(0);
            }
        },
        [isEnabled, isRefreshing, isDragging, canPull, isAtTop, maxPull],
    );

    const finishPull = useCallback(async (): Promise<void> => {
        setIsDragging(false);

        if (pullDistance < threshold) {
            setPullDistance(0);
            return;
        }

        setIsRefreshing(true);
        setPullDistance(32);

        const startTime = Date.now();

        try {
            if (onRefresh) {
                await onRefresh();
            } else if (typeof window !== "undefined") {
                window.location.reload();
            }
        } finally {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minRefreshTime - elapsed);
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsRefreshing(false);
            setPullDistance(0);
        }
    }, [onRefresh, pullDistance, threshold, minRefreshTime]);

    const handleTouchEnd = useCallback((): void => {
        if (!isEnabled || isRefreshing || !canPull || !isAtTop) return;
        void finishPull();
    }, [isEnabled, isRefreshing, canPull, isAtTop, finishPull]);

    const handleTouchCancel = useCallback((): void => {
        setIsDragging(false);
        setPullDistance(0);
    }, []);

    const IndicatorIcon = useMemo(() => {
        if (isRefreshing) return null;
        return ArrowDown;
    }, [isRefreshing]);

    const Component = as;

    return (
        <>
            <div
                className={cn(
                    "pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-12 items-center justify-center text-muted-foreground transition-opacity mt-[env(safe-area-inset-top)]",
                    pullDistance > 0 || isRefreshing
                        ? "opacity-100"
                        : "opacity-0",
                    indicatorClassName,
                )}
            >
                <div className="flex items-center gap-2 text-xs">
                    {isRefreshing ? (
                        <Spinner size={24} />
                    ) : pullDistance > 0 && IndicatorIcon ? (
                        <IndicatorIcon
                            className="size-4 transition-transform"
                            style={{
                                transform: `rotate(${progress * 180}deg)`,
                            }}
                        />
                    ) : null}
                    {(pullDistance > 0 || isRefreshing) && (
                        <span>
                            {isRefreshing
                                ? refreshingText
                                : progress >= 1
                                  ? releaseText
                                  : pullText}
                        </span>
                    )}
                </div>
            </div>
            <Component
                id={id}
                ref={(node) => {
                    containerRef.current = node;
                }}
                className={cn("relative select-none", className)}
                style={contentStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                aria-busy={isRefreshing}
            >
                {children}
            </Component>
        </>
    );
}
