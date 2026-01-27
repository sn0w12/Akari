"use client";

import { useDevice } from "@/contexts/device-context";
import { cn } from "@/lib/utils";
import { ArrowDown, RefreshCcw } from "lucide-react";
import React, {
    CSSProperties,
    ReactNode,
    useCallback,
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
    className?: string;
    style?: CSSProperties;
    contentClassName?: string;
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

const DEFAULT_THRESHOLD: number = 72;
const DEFAULT_MAX_PULL: number = 120;

export function PullToRefresh({
    children,
    onRefresh,
    enabled,
    threshold = DEFAULT_THRESHOLD,
    maxPull = DEFAULT_MAX_PULL,
    className,
    style,
    contentClassName,
    indicatorClassName,
    pullText = "Pull to refresh",
    releaseText = "Release to refresh",
    refreshingText = "Refreshing...",
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

    const progress: number = useMemo(
        () => Math.min(pullDistance / threshold, 1),
        [pullDistance, threshold],
    );

    const contentStyle: CSSProperties = useMemo(
        () => ({
            transform:
                pullDistance > 0
                    ? `translate3d(0, ${pullDistance}px, 0)`
                    : undefined,
            transition: isDragging ? "none" : "transform 200ms ease-out",
        }),
        [pullDistance, isDragging],
    );

    const handleTouchStart = useCallback(
        (event: React.TouchEvent<HTMLElement>): void => {
            if (!isEnabled || isRefreshing) return;

            const container = containerRef.current;
            if (!container) return;
            if (container.scrollTop > 0) return;

            const touch = event.touches[0];
            startRef.current = { y: touch.clientY };
            setIsDragging(true);
        },
        [isEnabled, isRefreshing],
    );

    const handleTouchMove = useCallback(
        (event: React.TouchEvent<HTMLElement>): void => {
            if (!isEnabled || isRefreshing || !isDragging) return;
            const start = startRef.current;
            if (!start) return;

            const touch = event.touches[0];
            const delta = touch.clientY - start.y;

            if (delta <= 0) {
                setPullDistance(0);
                return;
            }

            event.preventDefault();
            setPullDistance(Math.min(delta, maxPull));
        },
        [isEnabled, isRefreshing, isDragging, maxPull],
    );

    const finishPull = useCallback(async (): Promise<void> => {
        setIsDragging(false);

        if (pullDistance < threshold) {
            setPullDistance(0);
            return;
        }

        setIsRefreshing(true);
        setPullDistance(threshold);

        try {
            if (onRefresh) {
                await onRefresh();
            } else if (typeof window !== "undefined") {
                window.location.reload();
            }
        } finally {
            setIsRefreshing(false);
            setPullDistance(0);
        }
    }, [onRefresh, pullDistance, threshold]);

    const handleTouchEnd = useCallback((): void => {
        if (!isEnabled || isRefreshing) return;
        void finishPull();
    }, [isEnabled, isRefreshing, finishPull]);

    const handleTouchCancel = useCallback((): void => {
        setIsDragging(false);
        setPullDistance(0);
    }, []);

    const IndicatorIcon = useMemo(() => {
        if (isRefreshing) return null;
        if (progress >= 1) return RefreshCcw;
        return ArrowDown;
    }, [isRefreshing, progress]);

    const Component = as;

    return (
        <Component
            id={id}
            ref={(node) => {
                containerRef.current = node;
            }}
            className={cn("relative select-none", className)}
            style={style}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            aria-busy={isRefreshing}
        >
            <div
                className={cn(
                    "pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-12 items-center justify-center text-muted-foreground transition-opacity",
                    pullDistance > 0 || isRefreshing
                        ? "opacity-100"
                        : "opacity-0",
                    indicatorClassName,
                )}
            >
                <div className="flex items-center gap-2 text-xs">
                    {isRefreshing ? (
                        <Spinner size={24} />
                    ) : IndicatorIcon ? (
                        <IndicatorIcon
                            className="size-4 transition-transform"
                            style={{
                                transform: `rotate(${progress * 180}deg)`,
                            }}
                        />
                    ) : null}
                    <span>
                        {isRefreshing
                            ? refreshingText
                            : progress >= 1
                              ? releaseText
                              : pullText}
                    </span>
                </div>
            </div>

            <div
                className={cn("min-h-full", contentClassName)}
                style={contentStyle}
            >
                {children}
            </div>
        </Component>
    );
}
