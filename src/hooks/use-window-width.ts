import { useEffect } from "react";
import { useThrottledState } from "@tanstack/react-pacer";

export function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useThrottledState(window.innerWidth, {
        wait: 100,
    });

    useEffect(() => {
        const controller = new AbortController();
        window.addEventListener(
            "resize",
            () => setWindowWidth(window.innerWidth),
            {
                signal: controller.signal,
            }
        );

        return () => controller.abort();
    }, [setWindowWidth]);

    return windowWidth;
}
