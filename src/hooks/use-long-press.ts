import { useBodyScrollListener } from "@/hooks/use-body-scroll-listener";
import type { MouseEventHandler, TouchEventHandler } from "react";
import { useCallback, useRef, useState } from "react";
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

interface LongPressOptions {
    /**
     * A haptic preset to trigger when the long-press fires.
     */
    hapticPreset: DefaultHapticPresetName;
    /**
     * A delay in milliseconds to wait before firing starting the long-press animation.
     */
    scaleDelay: number;
    /**
     * A scale factor to apply to the element while it's being long-pressed.
     */
    scaleTarget: number;
    /**
     * Duration (ms) of the *release* transition.  By default the hook uses
     * `delay - scaleDelay`, which can feel slow when the full delay is large.
     * This lets callers choose a shorter fade‑back animation.
     */
    releaseDuration: number;
    /**
     * When true, the pressed state is NOT automatically cleared when the user
     * releases after a long-press fires.  Call the returned `release()` function
     * to reset it manually.
     */
    controlledAfterPress: boolean;
}

function getLongPressOptions(
    options?: Partial<LongPressOptions>,
): LongPressOptions {
    return {
        hapticPreset: options?.hapticPreset ?? "medium",
        scaleDelay: options?.scaleDelay ?? 100,
        scaleTarget: options?.scaleTarget ?? 1.025,
        releaseDuration: options?.releaseDuration ?? 150,
        controlledAfterPress: options?.controlledAfterPress ?? false,
    };
}

export function useLongPress(
    callback: () => void,
    delay: number = 500,
    options?: Partial<LongPressOptions>,
): {
    /** Handlers to spread onto the target element. */
    handlers: {
        onMouseDown: MouseEventHandler;
        onMouseUp: MouseEventHandler;
        onMouseLeave: MouseEventHandler;
        onTouchStart: TouchEventHandler;
        onTouchEnd: TouchEventHandler;
        onTouchCancel: TouchEventHandler;
        onClick: MouseEventHandler;
        onClickCapture: MouseEventHandler;
        onContextMenu: MouseEventHandler;
    };
    /** Style to spread onto the target element. */
    style: React.CSSProperties;
    /** Manually reset the pressed state. Only needed when `controlledAfterPress` is true. */
    release: () => void;
} {
    const { trigger } = useWebHaptics();
    const timerRef = useRef<number | null>(null);
    const isPressed = useRef(false);
    const longPressed = useRef(false);
    const initialScroll = useRef(0);
    const [pressed, setPressed] = useState(false);
    const SCROLL_CANCEL_THRESHOLD = 5; // pixels
    const opt = getLongPressOptions(options);

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
            setPressed(true);
            initialScroll.current = getScrollPos();

            timerRef.current = window.setTimeout(() => {
                if (isPressed.current) {
                    callback(); // Execute the action after hold
                    if (opt.hapticPreset) {
                        trigger(opt.hapticPreset);
                    }
                    longPressed.current = true;
                }
                timerRef.current = null;
            }, delay);
        },
        [callback, delay, opt, trigger],
    );

    const stopTimer = useCallback(
        (fromUser = false) => {
            isPressed.current = false;
            // In controlled mode, keep pressed=true after the callback has fired so
            // the caller can decide when to visually release (e.g. on popup close).
            if (
                !(fromUser && opt.controlledAfterPress && longPressed.current)
            ) {
                setPressed(false);
            }
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        },
        [opt.controlledAfterPress],
    );

    const release = useCallback(() => {
        setPressed(false);
        longPressed.current = false;
    }, []);

    const stop: MouseEventHandler & TouchEventHandler = useCallback(
        (e) => {
            // Only prevent default on touchend if a long-press actually fired.
            // Preventing it unconditionally cancels the browser's synthetic click
            // event, which breaks normal taps.
            if (e && "touches" in e && e.cancelable && longPressed.current) {
                e.preventDefault();
            }

            stopTimer(true);
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
        // suppress the context menu which Chrome mobile emulator fires on a long touch.
        // Do NOT reset longPressed.current here — contextmenu fires before touchend, so
        // resetting it here would cause stopTimer to clear the controlled pressed state
        // before the caller gets a chance to release it.  onClick handles the reset.
        e.preventDefault();
        if (longPressed.current) {
            e.stopPropagation();
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
                stopTimer(true);
            }
        },
        { passive: true },
        true,
    );

    const transitionDuration = pressed
        ? delay - opt.scaleDelay
        : opt.releaseDuration;

    return {
        handlers: {
            onMouseDown: start,
            onMouseUp: stop,
            onMouseLeave: stop,
            onTouchStart: start,
            onTouchEnd: stop,
            onTouchCancel: stop,
            onClick,
            onClickCapture: onClick,
            onContextMenu,
        },
        release,
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
            backfaceVisibility: "hidden",
            // Always keep the element on the GPU compositing layer so the
            // browser never re-rasterizes it mid-animation (which causes blur).
            willChange: opt.scaleTarget !== 1 ? "transform" : undefined,
            transform:
                opt.scaleTarget !== 1
                    ? pressed
                        ? `translateZ(0) scale(${opt.scaleTarget})`
                        : "translateZ(0)"
                    : undefined,
            transition:
                opt.scaleTarget !== 1
                    ? `transform ${transitionDuration}ms cubic-bezier(0.3, 0.05, 0.3, 0.8)`
                    : undefined,
            transitionDelay: pressed ? `${opt.scaleDelay}ms` : undefined,
        },
    };
}
