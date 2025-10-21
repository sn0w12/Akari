import { useState, useEffect } from "react";

export function useKeyPressed() {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setPressedKeys((prev) => {
                const next = new Set(prev);
                if (e.ctrlKey) next.add("ctrl");
                if (e.shiftKey) next.add("shift");
                if (e.altKey) next.add("alt");
                if (e.key) next.add(e.key.toLowerCase());
                return next;
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            setPressedKeys((prev) => {
                const next = new Set(prev);
                if (!e.ctrlKey) next.delete("ctrl");
                if (!e.shiftKey) next.delete("shift");
                if (!e.altKey) next.delete("alt");
                if (e.key) next.delete(e.key.toLowerCase());
                return next;
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return pressedKeys;
}
