import { useEffect, useRef, useState } from "react";

/**
 * useSticky hook detects if an element is currently "stuck" due to CSS position: sticky.
 * Returns a ref to attach to the sticky element and a boolean indicating if it's stuck.
 */
export function useSticky(
    offset: number = 0
): [React.RefObject<HTMLDivElement | null>, boolean] {
    const ref = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || !element.parentElement) {
            console.warn("Sticky ref not attached to any element.");
            return;
        }

        const parent = element.parentElement;
        if (window.getComputedStyle(parent).position === "static") {
            parent.style.position = "relative";
        }

        const grandParent = parent.parentElement;
        if (!grandParent) {
            console.log(
                "No grandparent found for sticky element, sentinel will be appended to body."
            );
        }

        const elementRect = element.getBoundingClientRect();
        const grandParentRect = grandParent
            ? grandParent.getBoundingClientRect()
            : { top: 0 };
        const top = elementRect.top - grandParentRect.top + offset;

        const sentinel = document.createElement("div");
        sentinel.style.position = "relative";
        sentinel.style.left = "0";
        sentinel.style.width = "100%";
        sentinel.style.height = "1px";
        sentinel.style.top = `${top}px`;

        if (grandParent) {
            grandParent.insertBefore(sentinel, parent);
        } else {
            document.body.appendChild(sentinel);
        }

        const observer = new window.IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0,
            }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
            if (sentinel.parentElement) {
                sentinel.parentElement.removeChild(sentinel);
            }
        };
    }, [offset]);

    return [ref, isSticky];
}
