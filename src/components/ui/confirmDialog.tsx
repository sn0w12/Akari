"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import Spinner from "@/components/ui/spinners/puffLoader";

interface ConfirmDialogProps {
    triggerButton: ReactNode; // The button or element to trigger the dialog
    title: string; // Title of the dialog
    message: string; // Message to display in the dialog
    confirmLabel?: string; // Label for the confirm button
    confirmColor?: string;
    cancelLabel?: string; // Label for the cancel button
    onConfirm: () => void; // Function to run on confirmation
}

const ConfirmDialog = ({
    triggerButton,
    title,
    message,
    confirmLabel = "Confirm",
    confirmColor = "",
    cancelLabel = "Cancel",
    onConfirm,
}: ConfirmDialogProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        const result = await Promise.resolve(onConfirm());
        if (result === undefined || result === true) {
            setOpen(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Ensure triggerButton is a single element */}
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="gap-2">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                </DialogHeader>
                <p>{message}</p>
                <div className="mt-2 flex justify-between space-x-2">
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            {cancelLabel}
                        </Button>
                    </DialogTrigger>
                    <Button
                        variant="outline"
                        onClick={handleConfirm}
                        className={`w-full ${confirmColor}`}
                    >
                        {loading ? <Spinner size={30} /> : confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDialog;
