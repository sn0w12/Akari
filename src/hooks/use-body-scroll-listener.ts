import { useEffect } from "react";

export function useBodyScrollListener(
    callback: (element: HTMLElement) => void,
    options: AddEventListenerOptions = { passive: true },
) {
    useEffect(() => {
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
        callback(initialElement);

        const controller = new AbortController();
        const signal = controller.signal;
        const wrappedCallback = () => {
            const mainScroll = mainElement.scrollTop;
            const windowScroll = window.scrollY;
            const element =
                mainScroll >= windowScroll
                    ? mainElement
                    : document.documentElement;
            callback(element);
        };

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
