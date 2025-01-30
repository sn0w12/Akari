import { useEffect, useCallback } from "react";

type ShortcutOptions = {
    preventDefault?: boolean;
};

export function useShortcut(
    shortcutKey: string,
    callback: () => void,
    options: ShortcutOptions = {},
) {
    const parseShortcut = useCallback((shortcut: string): string[] => {
        return shortcut.toLowerCase().split("+");
    }, []);

    const matchesShortcut = useCallback(
        (event: KeyboardEvent, keys: string[]): boolean => {
            const pressedKeys = [];
            if (event.ctrlKey) pressedKeys.push("ctrl");
            if (event.shiftKey) pressedKeys.push("shift");
            if (event.altKey) pressedKeys.push("alt");
            pressedKeys.push(event.key.toLowerCase());

            return JSON.stringify(pressedKeys) === JSON.stringify(keys);
        },
        [],
    );

    useEffect(() => {
        const keys = parseShortcut(shortcutKey);

        const handler = (event: KeyboardEvent) => {
            if (matchesShortcut(event, keys)) {
                if (options.preventDefault) {
                    event.preventDefault();
                }
                callback();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [
        shortcutKey,
        callback,
        options.preventDefault,
        parseShortcut,
        matchesShortcut,
    ]);
}
