import { useDevice } from "@/contexts/device-context";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import {
    formatForDisplay,
    Hotkey,
    RegisterableHotkey,
    useHeldKeys,
} from "@tanstack/react-hotkeys";
import { badgeVariants } from "./badge";

interface KeyboardShortcutProps {
    keys: RegisterableHotkey;
    className?: string;
}

function Kbd({
    children,
    isPressed,
}: {
    children: React.ReactNode;
    isPressed: boolean;
}) {
    const variant = isPressed ? "success" : "outline";
    return (
        <kbd
            className={cn(
                badgeVariants({ variant, size: "default" }),
                "px-1 py-0.5 text-xs transition-colors",
            )}
        >
            {children}
        </kbd>
    );
}

function KeyboardShortcut({ keys, className = "" }: KeyboardShortcutProps) {
    const pressedKeys = useHeldKeys();
    const formattedPressedKeys = pressedKeys.map((key) => {
        if (key === "Control") return "Ctrl";
        return formatForDisplay(key);
    });
    const { deviceType } = useDevice();

    const shouldShow = useSetting("showShortcuts");
    if (!shouldShow || deviceType === "mobile") return null;

    return (
        <span
            className={cn(
                "text-foreground/70 pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-1 text-sm",
                className,
            )}
        >
            {formatForDisplay(keys as Hotkey)
                .split("+")
                .map((key, index) => (
                    <Kbd
                        key={`${index}-${key}`}
                        isPressed={formattedPressedKeys.includes(key)}
                    >
                        {key}
                    </Kbd>
                ))}
        </span>
    );
}

function ContextKeyboardShortcut({
    keys,
    className = "",
}: KeyboardShortcutProps) {
    const pressedKeys = useHeldKeys();
    const formattedPressedKeys = pressedKeys.map((key) => {
        if (key === "Control") return "Ctrl";
        return formatForDisplay(key);
    });
    const { deviceType } = useDevice();

    const shouldShow = useSetting("showShortcuts");
    if (!shouldShow || deviceType === "mobile") return null;

    return (
        <span
            className={cn(
                "text-muted-foreground pointer-events-none flex gap-1 text-sm",
                className,
            )}
        >
            {formatForDisplay(keys as Hotkey)
                .split("+")
                .map((key, index) => (
                    <Kbd
                        key={`${index}-${key}`}
                        isPressed={formattedPressedKeys.includes(key)}
                    >
                        {key}
                    </Kbd>
                ))}
        </span>
    );
}

export { ContextKeyboardShortcut, KeyboardShortcut };
