import { useThrottledState } from "@tanstack/react-pacer";
import { useEffect } from "react";

export function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useThrottledState(0, {
        wait: 100,
    });

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [setWindowWidth]);

    return windowWidth;
}
