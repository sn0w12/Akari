import { useDevice } from "@/contexts/device-context";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import {
    formatForDisplay,
    Hotkey,
    RegisterableHotkey,
    useHeldKeys,
} from "@tanstack/react-hotkeys";

interface KeyboardShortcutProps {
    keys: RegisterableHotkey;
    className?: string;
}

function Kbd({
    className,
    isPressed,
    ...props
}: React.ComponentProps<"kbd"> & { isPressed: boolean }): React.ReactElement {
    const bg = isPressed
        ? "bg-success text-background dark:text-foreground"
        : "bg-muted text-muted-foreground";
    return (
        <kbd
            className={cn(
                "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded-[.25rem] px-1 font-medium text-xs transition-colors duration-50 ease-snappy [&_svg:not([class*='size-'])]:size-3",
                bg,
                className,
            )}
            data-slot="kbd"
            {...props}
        />
    );
}

function KbdGroup({
    className,
    ...props
}: React.ComponentProps<"kbd">): React.ReactElement {
    return (
        <kbd
            className={cn("inline-flex items-center gap-1", className)}
            data-slot="kbd-group"
            {...props}
        />
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
        <KbdGroup
            className={cn(
                "absolute top-1/2 right-3 flex -translate-y-1/2",
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
        </KbdGroup>
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
        <KbdGroup className={className}>
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
        </KbdGroup>
    );
}

export { ContextKeyboardShortcut, KeyboardShortcut };
