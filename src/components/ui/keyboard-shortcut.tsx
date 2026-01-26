import { useKeyPressed } from "@/hooks/use-keys-pressed";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

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

function Kbd({
    children,
    isPressed,
}: {
    children: React.ReactNode;
    isPressed: boolean;
}) {
    return (
        <kbd
            className={cn(
                "rounded-md border px-1 py-0.5 text-xs transition-colors",
                {
                    "bg-accent-positive border-accent-positive text-primary-foreground":
                        isPressed,
                    "bg-muted": !isPressed,
                },
            )}
        >
            {children}
        </kbd>
    );
}

function KeyboardShortcut({ keys, className = "" }: KeyboardShortcutProps) {
    const parsedKeys = ParseShortcutKeys(keys);
    const pressedKeys = useKeyPressed();

    const shouldShow = useSetting("showShortcuts");
    if (!shouldShow) return null;

    return (
        <span
            className={cn(
                "text-foreground/70 pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-1 text-sm",
                className,
            )}
        >
            {parsedKeys.map((key, index) => (
                <Kbd
                    key={`${parsedKeys.join("-")}-${index}`}
                    isPressed={pressedKeys.has(key.toLowerCase())}
                >
                    {getKeyVisual(key)}
                </Kbd>
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

    const shouldShow = useSetting("showShortcuts");
    if (!shouldShow) return null;

    return (
        <span
            className={cn(
                "text-muted-foreground pointer-events-none flex gap-1 text-sm",
                className,
            )}
        >
            {parsedKeys.map((key, index) => (
                <Kbd
                    key={`${parsedKeys.join("-")}-${index}`}
                    isPressed={pressedKeys.has(key.toLowerCase())}
                >
                    {getKeyVisual(key)}
                </Kbd>
            ))}
        </span>
    );
}

export { ContextKeyboardShortcut, KeyboardShortcut };
