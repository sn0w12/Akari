"use client";

import { ErrorComponent } from "@/components/error-page";
import { usePathname } from "next/navigation";
import * as React from "react";

interface ValidationError {
    errors: { id: string[] };
    status: number;
    title: string;
    traceId: string;
    type: string;
}

type ErrorResponse = components["schemas"]["ErrorResponse"] | ValidationError;

interface ErrorContextType {
    setError: (error: ErrorResponse) => void;
    clearError: () => void;
}

const ErrorContext = React.createContext<ErrorContextType | undefined>(
    undefined,
);

export function useError() {
    const context = React.useContext(ErrorContext);
    if (!context) {
        throw new Error("useError must be used within an ErrorProvider");
    }
    return context;
}

export interface ErrorData {
    message: string;
    details: string | null;
    status: number;
}

function getErrorDetails(error: ErrorResponse): ErrorData {
    if ("errors" in error) {
        return {
            message: error.title,
            status: error.status,
            details: Object.values(error.errors).flat().join(", ") || null,
        };
    }
    return {
        message: error.data.message,
        status: error.status,
        details: error.data.details || null,
    };
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
    const [errorState, setErrorState] = React.useState<ErrorData | null>(null);
    const pathname = usePathname();
    const prevPathname = React.useRef(pathname);

    React.useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;
            setErrorState(null);
        }
    }, [pathname]);

    const setError = React.useCallback((error: ErrorResponse) => {
        setErrorState(getErrorDetails(error));
    }, []);

    const clearError = React.useCallback(() => {
        setErrorState(null);
    }, []);

    return (
        <ErrorContext.Provider value={{ setError, clearError }}>
            {errorState ? (
                <ErrorComponent
                    message={errorState.message}
                    details={errorState.details}
                    status={errorState.status}
                />
            ) : (
                children
            )}
        </ErrorContext.Provider>
    );
}
