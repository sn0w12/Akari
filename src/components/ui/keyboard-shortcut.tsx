import React from "react";
import { useKeyPressed } from "@/hooks/use-keys-pressed";

interface KeyboardShortcutProps {
    keys: string[] | string;
    className?: string;
}

const KEY_VISUALS: Record<string, string> = {
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    enter: "⏎",
    escape: "⎋",
    space: "␣",
    tab: "⇥",
    backspace: "⌫",
    delete: "del",
    control: "ctrl",
    alt: "alt",
    meta: "⌘",
    capslock: "caps",
};

function ParseShortcutKeys(keys: string[] | string): string[] {
    if (Array.isArray(keys)) {
        return keys.map((key) => key.toLowerCase());
    }
    return keys.toLowerCase().split("+");
}

function getKeyVisual(key: string): string {
    const normalized = key.trim().toLowerCase();
    return KEY_VISUALS[normalized] ?? key;
}

function KeyboardShortcut({ keys, className = "" }: KeyboardShortcutProps) {
    const parsedKeys = ParseShortcutKeys(keys);
    const pressedKeys = useKeyPressed();

    return (
        <span
            className={`text-muted-foreground pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-2 text-sm ${className}`}
        >
            {parsedKeys.map((key, index) => (
                <kbd
                    key={`${parsedKeys.join("-")}-${index}`}
                    className={`rounded-md border px-1 py-0.5 text-xs transition-colors ${
                        pressedKeys.has(key.toLowerCase())
                            ? "bg-accent-positive border-accent-positive text-primary-foreground"
                            : "bg-muted"
                    }`}
                >
                    {getKeyVisual(key)}
                </kbd>
            ))}
        </span>
    );
}

function ContextKeyboardShortcut({
    keys,
    className = "",
}: KeyboardShortcutProps) {
    const parsedKeys = ParseShortcutKeys(keys);
    const pressedKeys = useKeyPressed();

    return (
        <span
            className={`text-muted-foreground pointer-events-none flex gap-1 text-sm ${className}`}
        >
            {parsedKeys.map((key, index) => (
                <kbd
                    key={`${parsedKeys.join("-")}-${index}`}
                    className={`rounded-md border px-1 py-0.5 text-xs transition-colors ${
                        pressedKeys.has(key.toLowerCase())
                            ? "bg-accent-positive border-accent-positive text-primary-foreground"
                            : "bg-muted"
                    }`}
                >
                    {getKeyVisual(key)}
                </kbd>
            ))}
        </span>
    );
}

function TooltipKeyboardShortcut({
    keys,
    className = "",
}: KeyboardShortcutProps) {
    const parsedKeys = ParseShortcutKeys(keys);
    const pressedKeys = useKeyPressed();

    return (
        <span
            className={`text-background pointer-events-none z-10 flex gap-1 text-sm ${className}`}
        >
            {parsedKeys.map((key, index) => (
                <kbd
                    key={`${parsedKeys.join("-")}-${index}`}
                    className={`bg-primary rounded-sm border px-1 text-xs transition-colors ${
                        pressedKeys.has(key.toLowerCase())
                            ? "bg-accent-positive border-accent-positive text-primary-foreground"
                            : "bg-muted"
                    }`}
                >
                    {getKeyVisual(key)}
                </kbd>
            ))}
        </span>
    );
}

export { KeyboardShortcut, ContextKeyboardShortcut, TooltipKeyboardShortcut };
