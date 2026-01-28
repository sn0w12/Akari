import { useThrottledState } from "@tanstack/react-pacer";
import { useEffect } from "react";

export function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useThrottledState(0, {
        wait: 100,
    });

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const controller = new AbortController();
        window.addEventListener(
            "resize",
            () => setWindowWidth(window.innerWidth),
            {
                signal: controller.signal,
            },
        );

        return () => controller.abort();
    }, [setWindowWidth]);

    return windowWidth;
}
