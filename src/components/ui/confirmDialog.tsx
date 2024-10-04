import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

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
    return (
        <Dialog>
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
                        onClick={onConfirm}
                        className={`w-full ${confirmColor}`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDialog;
