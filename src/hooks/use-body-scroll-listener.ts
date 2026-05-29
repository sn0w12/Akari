import { useEffect, useRef } from "react";

export function useBodyScrollListener(
    callback: (element: HTMLElement) => void,
    options: AddEventListenerOptions = { passive: true },
    enabled: boolean = true,
) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === "undefined") return;

        const mainElement = document.getElementById(
            "scroll-element",
        ) as HTMLElement;
        if (!mainElement) return;

        // Initial call to set up metrics
        const initialMainScroll = mainElement.scrollTop;
        const initialWindowScroll = window.scrollY;
        const initialElement =
            initialMainScroll >= initialWindowScroll
                ? mainElement
                : document.documentElement;
        callbackRef.current(initialElement);

        const wrappedCallback = () => {
            const mainScroll = mainElement.scrollTop;
            const windowScroll = window.scrollY;
            const element =
                mainScroll >= windowScroll
                    ? mainElement
                    : document.documentElement;
            callbackRef.current(element);
        };

        mainElement.addEventListener("scroll", wrappedCallback, {
            passive: true,
        });
        window.addEventListener("scroll", wrappedCallback, { passive: true });

        return () => {
            mainElement.removeEventListener("scroll", wrappedCallback);
            window.removeEventListener("scroll", wrappedCallback);
        };
    }, [enabled]);
}
