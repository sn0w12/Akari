"use client";

import React, { useEffect, useState, useRef } from "react";
import { Toast, useToast } from "./ToastContext";
import { cn } from "@/lib/utils";
import { X, Check, AlertTriangle, Info } from "lucide-react";

// Icons for each toast type
const ToastIcon: React.FC<{ type: Toast["type"] }> = ({ type }) => {
    const iconSize = "h-6 w-6";

    switch (type) {
        case "success":
            return (
                <div className="rounded-full">
                    <Check className={`${iconSize} text-positive`} />
                </div>
            );
        case "error":
            return (
                <div className="rounded-full">
                    <X className={`${iconSize} text-negative`} />
                </div>
            );
        case "warning":
            return (
                <div className="rounded-full">
                    <AlertTriangle className={`${iconSize} text-warning`} />
                </div>
            );
        case "info":
            return (
                <div className="rounded-full">
                    <Info className={`${iconSize} text-info`} />
                </div>
            );
        default:
            return null;
    }
};

interface ToastItemProps {
    toast: Toast;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
    const { removeToast } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    const [opacityValue, setOpacityValue] = useState(100);
    const [animationDuration, setAnimationDuration] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const { autoClose = 5000 } = toast.options;
    const shouldAutoClose = autoClose !== false && autoClose !== 0;
    const startTimeRef = useRef<number | null>(null);
    const pauseTimeRef = useRef<number | null>(null);
    const remainingTimeRef = useRef<number | null>(null);

    const typeClasses = {
        success: "border-positive",
        error: "border-negative",
        warning: "border-warning",
        info: "border-info",
        default: "border-gray-300",
    };

    const typeProgressClasses = {
        success: "bg-positive",
        error: "bg-negative",
        warning: "bg-warning",
        info: "bg-info",
        default: "bg-gray-300 dark:bg-gray-700",
    };

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        const delay = toast.options.delay || 0;

        const timeoutId = setTimeout(() => {
            if (shouldAutoClose) {
                setProgress(100);

                // A small delay to ensure the browser has processed the initial state
                const progressAnimationTimeout = setTimeout(() => {
                    // Set animation duration based on autoClose time
                    setAnimationDuration(autoClose as number);
                    startTimeRef.current = Date.now();
                    remainingTimeRef.current = autoClose as number;

                    // Use RAF to ensure the browser has completed a render cycle
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Start the countdown with CSS animation
                            setProgress(0);
                        });
                    });
                }, 50); // Small delay to ensure initial render completes

                return () => clearTimeout(progressAnimationTimeout);
            } else {
                // For non-autoclose toasts, animate the progress bar opacity
                animateProgressBarOpacity();
            }
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoClose, shouldAutoClose, toast.options.delay]);

    const handleAnimationEnd = () => {
        if (shouldAutoClose) {
            handleClose();
        }
    };

    const animateProgressBarOpacity = () => {
        let increasing = false;
        let opacity = 100;

        const intervalId = window.setInterval(() => {
            if (increasing) {
                opacity += 1;
                if (opacity >= 100) {
                    opacity = 100;
                    increasing = false;
                }
            } else {
                opacity -= 1;
                if (opacity <= 50) {
                    opacity = 50;
                    increasing = true;
                }
            }

            setOpacityValue(opacity);
        }, 30) as unknown as number;

        intervalRef.current = intervalId;
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            removeToast(toast.id);
        }, 300); // Wait for exit animation
    };

    const handleMouseEnter = () => {
        if (toast.options.pauseOnHover && shouldAutoClose) {
            pauseTimeRef.current = Date.now();

            // Pause the animation by capturing the current state
            if (progressBarRef.current) {
                const computedStyle = window.getComputedStyle(
                    progressBarRef.current,
                );
                const width =
                    (parseFloat(computedStyle.width) /
                        parseFloat(
                            progressBarRef.current.parentElement?.offsetWidth.toString() ||
                                "100",
                        )) *
                    100;

                // Stop the animation and keep the current width
                setProgress(-1); // Special value to indicate pause
                progressBarRef.current.style.width = `${width}%`;
                progressBarRef.current.style.transitionProperty = "none";

                // Store remaining time based on current width
                remainingTimeRef.current =
                    (width / 100) * (autoClose as number);
            }
        }
    };

    return (
        <div
            className={cn(
                "rounded-lg border shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden bg-card text-card-foreground cursor-pointer",
                typeClasses[toast.type],
                isVisible
                    ? "opacity-100 translate-y-0 max-h-96"
                    : "opacity-0 translate-y-4 max-h-0",
            )}
            role="alert"
            aria-live="assertive"
            onClick={handleClose}
            onMouseEnter={handleMouseEnter}
        >
            <div className="p-4 flex items-center gap-3 relative">
                <div className="flex-shrink-0">
                    <ToastIcon type={toast.type} />
                </div>
                <div className="flex-grow">
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Progress bar - always show but with different behavior based on shouldAutoClose */}
            <div className="w-full" style={{ height: "0.25rem" }}>
                <div
                    ref={progressBarRef}
                    className={cn(
                        "h-full",
                        typeProgressClasses[toast.type],
                        shouldAutoClose ? "transition-[width]" : "",
                    )}
                    style={{
                        width: progress >= 0 ? `${progress}%` : undefined,
                        transitionDuration: `${animationDuration}ms`,
                        transitionTimingFunction: "linear",
                        opacity: shouldAutoClose ? 1 : opacityValue / 100,
                    }}
                    onTransitionEnd={handleAnimationEnd}
                />
            </div>
        </div>
    );
};
