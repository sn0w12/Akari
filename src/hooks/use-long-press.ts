import { useBodyScrollListener } from "@/hooks/use-body-scroll-listener";
import type { MouseEventHandler, TouchEventHandler } from "react";
import { useCallback, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";

type DefaultHapticPresetName =
    | "success"
    | "warning"
    | "error"
    | "light"
    | "medium"
    | "heavy"
    | "soft"
    | "rigid"
    | "selection"
    | "nudge"
    | "buzz";

export function useLongPress(
    callback: () => void,
    delay: number = 500,
    hapticPreset: DefaultHapticPresetName | null = "medium",
): {
    onMouseDown: MouseEventHandler;
    onMouseUp: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
    onTouchStart: TouchEventHandler;
    onTouchEnd: TouchEventHandler;
    onTouchCancel: TouchEventHandler;
    onClick: MouseEventHandler;
    onClickCapture: MouseEventHandler;
    onContextMenu: MouseEventHandler;
} {
    const { trigger } = useWebHaptics();
    const timerRef = useRef<number | null>(null);
    const isPressed = useRef(false);
    const longPressed = useRef(false);
    const initialScroll = useRef(0);
    const SCROLL_CANCEL_THRESHOLD = 5; // pixels

    const getScrollPos = () => {
        if (typeof window === "undefined") return 0;
        const main = document.getElementById("scroll-element");
        if (!main) return window.scrollY;
        const mainScroll = main.scrollTop;
        const windowScroll = window.scrollY;
        return mainScroll >= windowScroll ? mainScroll : windowScroll;
    };

    const start: MouseEventHandler & TouchEventHandler = useCallback(() => {
        if (typeof window === "undefined") return; // Ensure we're in a browser environment
        if (timerRef.current) return; // timer already running

        isPressed.current = true;
        initialScroll.current = getScrollPos();

        timerRef.current = window.setTimeout(() => {
            if (isPressed.current) {
                callback(); // Execute the action after hold
                if (hapticPreset) {
                    trigger(hapticPreset);
                }
                longPressed.current = true;
            }
            timerRef.current = null;
        }, delay);
    }, [callback, delay, hapticPreset, trigger]);

    const stopTimer = useCallback(() => {
        isPressed.current = false;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stop: MouseEventHandler & TouchEventHandler = useCallback(() => {
        stopTimer();
    }, [stopTimer]);

    const onClick: MouseEventHandler = useCallback((e) => {
        if (longPressed.current) {
            // if a long press just triggered, prevent normal click behavior
            e.preventDefault();
            e.stopPropagation();
            longPressed.current = false;
        }
    }, []);

    const onContextMenu: MouseEventHandler = useCallback((e) => {
        // suppress the context menu which Chrome mobile emulator fires on a long touch
        if (longPressed.current) {
            e.preventDefault();
            e.stopPropagation();
            longPressed.current = false;
        } else {
            // always prevent default so the system menu never appears while using the hook
            e.preventDefault();
        }
    }, []);

    // cancel long press if the user scrolls more than a few pixels
    useBodyScrollListener(
        (element) => {
            if (!isPressed.current) return;
            const current = element.scrollTop ?? window.scrollY;
            if (
                Math.abs(current - initialScroll.current) >
                SCROLL_CANCEL_THRESHOLD
            ) {
                stopTimer();
            }
        },
        { passive: true },
        true,
    );

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
        onTouchCancel: stop,
        onClick,
        onClickCapture: onClick,
        onContextMenu,
    };
}
