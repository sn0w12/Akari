import {
    createContext,
    useCallback,
    use,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

type BorderColor = `border-${string}`;

interface BorderColorContextType {
    borderClass: string;
    flashColor: (color: BorderColor) => void;
}

const BorderColorContext = createContext<BorderColorContextType | undefined>(
    undefined,
);

export function BorderColorProvider({
    children,
    duration = 1000,
}: {
    children: ReactNode;
    duration?: number;
}) {
    const [currentColor, setCurrentColor] = useState<BorderColor | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const borderClass = currentColor
        ? `${currentColor} transition-colors duration-[${duration}ms] ease-in-out`
        : `transition-colors duration-[${duration}ms] ease-in-out`;

    const flashColor = useCallback(
        (color: BorderColor) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setCurrentColor(color);
            timeoutRef.current = setTimeout(() => {
                setCurrentColor(null);
                timeoutRef.current = null;
            }, duration);
        },
        [duration],
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <BorderColorContext.Provider value={{ borderClass, flashColor }}>
            {children}
        </BorderColorContext.Provider>
    );
}

export function useBorderColor() {
    const context = use(BorderColorContext);
    if (!context) {
        throw new Error(
            "useBorderColor must be used within a BorderColorProvider",
        );
    }
    return context;
}
