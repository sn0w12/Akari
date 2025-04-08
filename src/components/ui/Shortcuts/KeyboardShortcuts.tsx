import { useKeyPressed } from "@/hooks/useKeysPressed";
import { cn } from "@/lib/utils";

interface KeyboardShortcutProps {
    keys: string[];
    className?: string;
}

export function KeyboardShortcut({
    keys,
    className = "",
}: KeyboardShortcutProps) {
    const pressedKeys = useKeyPressed();

    return (
        <span
            className={cn(
                `pointer-events-none flex gap-2 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm`,
                className,
            )}
        >
            {keys.map((key, index) => (
                <kbd
                    key={`${keys.join("-")}-${index}`}
                    className={`px-1 py-0.5 text-xs border rounded-md transition-colors ${
                        pressedKeys.has(key.toLowerCase())
                            ? "bg-accent-color border-accent-color text-primary-foreground"
                            : "bg-muted"
                    }`}
                >
                    {key}
                </kbd>
            ))}
        </span>
    );
}
