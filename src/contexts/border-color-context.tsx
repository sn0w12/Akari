"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

type borderColor = `border-${string}`;

interface BorderColorContextType {
    borderClass: string;
    flashColor: (color: borderColor) => void;
}

const BorderColorContext = createContext<BorderColorContextType | undefined>(
    undefined,
);

export function BorderColorProvider({
    children,
    baseColor,
    duration = 1000,
}: {
    children: ReactNode;
    baseColor: borderColor;
    duration?: number;
}) {
    const [currentColor, setCurrentColor] = useState<borderColor>(baseColor);
    const borderClass = useMemo(() => {
        return `${currentColor} transition-colors duration-[${duration}ms] ease-in-out`;
    }, [currentColor, duration]);

    function flashColor(color: borderColor) {
        setCurrentColor(color);
        setTimeout(() => {
            setCurrentColor(baseColor);
        }, duration);
    }

    return (
        <BorderColorContext.Provider value={{ borderClass, flashColor }}>
            {children}
        </BorderColorContext.Provider>
    );
}

export function useBorderColor() {
    const context = useContext(BorderColorContext);
    if (!context) {
        throw new Error(
            "useBorderColor must be used within a BorderColorProvider",
        );
    }
    return context;
}
