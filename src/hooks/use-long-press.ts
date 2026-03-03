import { useBodyScrollListener } from "@/hooks/use-body-scroll-listener";
import type { MouseEventHandler, TouchEventHandler } from "react";
import { useCallback, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";

export type DefaultHapticPresetName =
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
    style: React.CSSProperties;
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

    const start: MouseEventHandler & TouchEventHandler = useCallback(
        (e) => {
            // preventDefault on touch events to stop Safari from showing the
            // native link/menu callout when a long‑press happens.  We only need
            // it for touch because mouse down on desktop doesn't trigger the
            // same menu and calling preventDefault there can interfere with
            // drag behavior.
            if (e && "touches" in e && e.cancelable) {
                e.preventDefault();
            }

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
        },
        [callback, delay, hapticPreset, trigger],
    );

    const stopTimer = useCallback(() => {
        isPressed.current = false;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stop: MouseEventHandler & TouchEventHandler = useCallback(
        (e) => {
            // also prevent default on touchend so the browser doesn't treat the
            // gesture as a tap/click that might trigger the link immediately after
            // our long‑press logic.  We still allow clicks to bubble normally in
            // onClick/onClickCapture.
            if (e && "touches" in e && e.cancelable) {
                e.preventDefault();
            }

            stopTimer();
        },
        [stopTimer],
    );

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
        // style for any element that uses the hook.  disabling user selection
        // stops Safari/iOS from highlighting text when you hold down, and the
        // touch-callout has already been disabled earlier.
        style: {
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
        },
    };
}
