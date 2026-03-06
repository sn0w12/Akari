"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DrawerHeader } from "@/components/ui/drawer";
import Spinner from "@/components/ui/puff-loader";
import * as React from "react";
import { useState } from "react";

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

// drawer-specific confirmation UI
interface DrawerConfirmProps {
    title: string;
    description?: string;
    onConfirm: () => void | Promise<boolean | void>;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function DrawerConfirm({
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: DrawerConfirmProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!isAsync(onConfirm)) {
            onConfirm();
            return;
        }

        setLoading(true);
        const result = await Promise.resolve(onConfirm());
        if (result === undefined || result === true) {
            // parent should handle closing drawer
        }
        setLoading(false);
    };

    const handleCancel = () => {
        onCancel?.();
    };

    return (
        <>
            <DrawerHeader className="pb-0">
                <DialogTitle>{title}</DialogTitle>
                {description && (
                    <DialogDescription>{description}</DialogDescription>
                )}
            </DrawerHeader>
            <div className="flex flex-col gap-2 p-2">
                <Button variant="outline" onClick={handleCancel}>
                    {cancelText}
                </Button>
                <Button
                    variant={
                        variant === "destructive" ? "destructive" : "default"
                    }
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? <Spinner size={30} /> : confirmText}
                </Button>
            </div>
        </>
    );
}
