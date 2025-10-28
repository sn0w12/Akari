"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbContextType {
    overrides: Record<string, string>;
    setOverride: (key: string, displayName: string) => void;
    clearOverride: (key: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
    undefined
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    const setOverride = (key: string, displayName: string) => {
        setOverrides((prev) => ({ ...prev, [key]: displayName }));
    };

    const clearOverride = (key: string) => {
        setOverrides((prev) => {
            const newOverrides = { ...prev };
            delete newOverrides[key];
            return newOverrides;
        });
    };

    return (
        <BreadcrumbContext.Provider
            value={{ overrides, setOverride, clearOverride }}
        >
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        throw new Error(
            "useBreadcrumb must be used within a BreadcrumbProvider"
        );
    }
    return context;
}
