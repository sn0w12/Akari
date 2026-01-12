"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/ui/confirm";

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
    const [options, setOptions] = React.useState<ConfirmOptions>({
        title: "",
        description: "",
        variant: "default",
    });

    const [resolveRef, setResolveRef] = React.useState<
        (value: boolean) => void
    >(() => () => {});

    const confirm = React.useCallback((options: ConfirmOptions) => {
        setOptions(options);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolveRef(() => resolve);
        });
    }, []);

    const handleConfirm = React.useCallback(() => {
        resolveRef(true);
    }, [resolveRef]);

    const handleCancel = React.useCallback(() => {
        resolveRef(false);
    }, [resolveRef]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title={options.title}
                description={options.description}
                confirmText={options.confirmText ?? "Confirm"}
                cancelText={options.cancelText ?? "Cancel"}
                variant={options.variant}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}
