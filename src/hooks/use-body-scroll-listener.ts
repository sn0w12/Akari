import { useEffect } from "react";

interface ScrollListenerOptions extends AddEventListenerOptions {}

export function useBodyScrollListener(
    callback: (element: HTMLElement) => void,
    options: ScrollListenerOptions = { passive: true },
) {
    useEffect(() => {
        const mainElement = document.getElementById(
            "scroll-element",
        ) as HTMLElement;
        if (!mainElement) return;

        // Initial call to set up metrics
        callback(mainElement);

        const controller = new AbortController();
        const signal = controller.signal;
        const wrappedCallback = () => callback(mainElement);

        mainElement.addEventListener("scroll", wrappedCallback, {
            ...options,
            signal,
        });
        window.addEventListener("scroll", wrappedCallback, {
            ...options,
            signal,
        });

        return () => {
            controller.abort();
        };
    }, [callback, options]);
}
