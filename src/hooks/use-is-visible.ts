import { useState, useEffect, useRef, useCallback } from "react";

interface UseIsVisibleOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
    /// if true, stops observing after first visibility
    once?: boolean;
}

export function useIsVisible(options: UseIsVisibleOptions = {}) {
    const { once = false, root, rootMargin, threshold } = options;

    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Callback that updates state when intersection changes
    const handleIntersection: IntersectionObserverCallback = useCallback(
        (entries) => {
            const [entry] = entries;
            const visible = entry.isIntersecting;
            setIsVisible(visible);

            // If `once` is true and now visible, disconnect
            if (once && visible && observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        },
        [once],
    );

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleIntersection, {
            root,
            rootMargin,
            threshold,
        });
        observer.observe(element);
        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [handleIntersection, root, rootMargin, threshold]);

    return { ref: elementRef, isVisible };
}
