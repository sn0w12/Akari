export const scrollState = {
    isScrolling: false,
    timeoutId: undefined as NodeJS.Timeout | undefined,
};

export function initializeScrollListener() {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
        scrollState.isScrolling = true;
        if (scrollState.timeoutId) {
            clearTimeout(scrollState.timeoutId);
        }
        scrollState.timeoutId = setTimeout(() => {
            scrollState.isScrolling = false;
        }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollState.timeoutId) {
            clearTimeout(scrollState.timeoutId);
        }
    };
}
