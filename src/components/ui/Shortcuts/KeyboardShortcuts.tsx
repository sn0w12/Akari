interface KeyboardShortcutProps {
    keys: string[];
    className?: string;
}

export function KeyboardShortcut({
    keys,
    className = "",
}: KeyboardShortcutProps) {
    return (
        <span
            className={`pointer-events-none flex gap-2 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm ${className}`}
        >
            {keys.map((key, index) => (
                <>
                    <kbd
                        key={`${key}-${index}`}
                        className="px-1 py-0.5 text-xs border rounded-md bg-muted"
                    >
                        {key}
                    </kbd>
                </>
            ))}
        </span>
    );
}
