import {
    createContext,
    ReactNode,
    useCallback,
    use,
    useMemo,
    useState,
} from "react";

interface BreadcrumbContextType {
    overrides: Record<string, string>;
    setOverride: (key: string, displayName: string) => void;
    clearOverride: (key: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
    undefined,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    const setOverride = useCallback((key: string, displayName: string) => {
        setOverrides((prev) => ({ ...prev, [key]: displayName }));
    }, []);

    const clearOverride = useCallback((key: string) => {
        setOverrides((prev) => {
            const newOverrides = { ...prev };
            delete newOverrides[key];
            return newOverrides;
        });
    }, []);

    const value = useMemo(
        () => ({ overrides, setOverride, clearOverride }),
        [overrides, setOverride, clearOverride],
    );

    return (
        <BreadcrumbContext.Provider value={value}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    const context = use(BreadcrumbContext);
    if (!context) {
        throw new Error(
            "useBreadcrumb must be used within a BreadcrumbProvider",
        );
    }
    return context;
}
