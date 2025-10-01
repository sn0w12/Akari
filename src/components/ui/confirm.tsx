"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Spinner from "@/components/ui/puff-loader";

function isAsync(fn: (...args: unknown[]) => unknown) {
    return fn.constructor.name === "AsyncFunction";
}

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText: string | null;
    cancelText: string | null;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = null,
    cancelText = null,
    variant = "default",
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!isAsync(onConfirm)) {
            onConfirm();
            onOpenChange(false);
            return;
        }

        setLoading(true);
        const result = await Promise.resolve(onConfirm());
        if (result === undefined || result === true) {
            onOpenChange(false);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    if (!confirmText) {
        confirmText = "Confirm";
    }
    if (!cancelText) {
        cancelText = "Cancel";
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={
                            variant === "destructive"
                                ? "destructive"
                                : "default"
                        }
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? <Spinner size={30} /> : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ButtonConfirmDialogProps {
    triggerButton: React.ReactNode;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string | null;
    cancelText?: string | null;
    variant?: "default" | "destructive";
}

export function ButtonConfirmDialog({
    triggerButton,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = null,
    cancelText = null,
    variant = "default",
}: ButtonConfirmDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!isAsync(onConfirm)) {
            onConfirm();
            setOpen(false);
            return;
        }

        setLoading(true);
        const result = await Promise.resolve(onConfirm());
        if (result === undefined || result === true) {
            setOpen(false);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        onCancel?.();
        setOpen(false);
    };

    if (!confirmText) {
        confirmText = "Confirm";
    }
    if (!cancelText) {
        cancelText = "Cancel";
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={
                            variant === "destructive"
                                ? "destructive"
                                : "default"
                        }
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? <Spinner size={30} /> : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
