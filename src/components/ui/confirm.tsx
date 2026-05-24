import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/puff-loader";
import {
    ResponsiveModal,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalHeader,
    ResponsiveModalPopup,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import * as React from "react";
import { useState } from "react";

export type ConfirmVariant = "default" | "destructive";

type ConfirmActionResult = boolean | void;

interface ConfirmContentProps {
    onConfirm: () => ConfirmActionResult | Promise<ConfirmActionResult>;
    onCancel?: () => void;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    variant?: ConfirmVariant;
}

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    onConfirm: () => ConfirmActionResult | Promise<ConfirmActionResult>;
    onCancel?: () => void;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    variant?: ConfirmVariant;
    popupProps?: React.ComponentProps<typeof ResponsiveModalPopup>;
}

function ConfirmActions({
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmContentProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const result = await Promise.resolve(onConfirm());
            if (result === false) return;
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outline" onClick={onCancel} disabled={loading}>
                {cancelText}
            </Button>
            <Button
                variant={variant === "destructive" ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={loading}
            >
                {loading ? <Spinner size={30} /> : confirmText}
            </Button>
        </>
    );
}

export function ResponsiveConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    popupProps,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        const result = await Promise.resolve(onConfirm());
        if (result === false) return false;

        onOpenChange(false);
        return true;
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModalPopup className="sm:max-w-[425px]" {...popupProps}>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
                    {description && (
                        <ResponsiveModalDescription>
                            {description}
                        </ResponsiveModalDescription>
                    )}
                </ResponsiveModalHeader>
                <ResponsiveModalFooter>
                    <ConfirmActions
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        confirmText={confirmText}
                        cancelText={cancelText}
                        variant={variant}
                    />
                </ResponsiveModalFooter>
            </ResponsiveModalPopup>
        </ResponsiveModal>
    );
}
