"use client";

import { ConfirmDialog } from "@/components/ui/confirm";
import * as React from "react";

interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = React.createContext<ConfirmContextType | undefined>(
    undefined,
);

export function useConfirm() {
    const context = React.useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [options, setOptions] = React.useState<ConfirmOptions | null>(null);

    const resolveRef = React.useRef<(value: boolean) => void>(() => {});

    const confirm = React.useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = React.useCallback(() => {
        setIsOpen(false);
        resolveRef.current(true);
        setOptions(null);
    }, []);

    const handleCancel = React.useCallback(() => {
        setIsOpen(false);
        resolveRef.current(false);
        setOptions(null);
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title={options?.title ?? ""}
                description={options?.description ?? ""}
                confirmText={options?.confirmText ?? "Confirm"}
                cancelText={options?.cancelText ?? "Cancel"}
                variant={options?.variant ?? "default"}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}
