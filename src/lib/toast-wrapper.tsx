"use client";

import { toast } from "sonner";
import { getSetting } from "./settings";
import { cn } from "./utils";

import { CircleCheck, CircleXIcon, InfoIcon, CircleAlert } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastOptions {
    autoClose?: number;
}

/**
 * A wrapper class for handling toast notifications with customizable options.
 * Integrates with Sonner toast notification system and respects user preferences for displaying notifications.
 *
 * @class Toast
 *
 * @constructor
 * @param {string} message - The message to display in the toast notification
 * @param {ToastType} type - The type of toast notification to display
 * @param {Object} [options={}] - Optional configuration options for the toast notification
 * @param {number} [options.autoClose=5000] - Auto close duration in ms (0 to disable)
 * @param {boolean} [options.closeOnClick=true] - Close the toast when clicked
 * @param {boolean} [options.pauseOnHover=true] - Pause the timer when hovering the toast
 * @param {boolean} [options.pauseOnFocusLoss=true] - Pause the toast when the window loses focus
 * @param {boolean} [options.draggable=true] - Allow toast to be dragged
 * @param {number} [options.delay=0] - Add a delay before the toast appears
 *
 * @method close - Dismisses all active toast notifications
 *
 * @example
 * const toast = new Toast("Operation successful", "success");
 * // Later...
 * toast.close();
 */
class Toast {
    constructor(message: string, type: ToastType, options: ToastOptions = {}) {
        const showToast = getSetting("useToast");
        if (!showToast) return;

        const { autoClose, ...restOptions } = options;
        const toastOptions = {
            duration: autoClose ?? 5000,
            ...restOptions,
        };

        toast.custom(
            () => <ToastComponent message={message} type={type} />,
            toastOptions
        );
    }

    close() {
        toast.dismiss();
    }
}

interface ToastProps {
    message: string;
    type: ToastType;
}

const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case "success":
            return <CircleCheck className="w-5 h-5" />;
        case "error":
            return <CircleXIcon className="w-5 h-5" />;
        case "info":
            return <InfoIcon className="w-5 h-5" />;
        case "warning":
            return <CircleAlert className="w-5 h-5" />;
    }
};

function ToastComponent({ message, type }: ToastProps) {
    return (
        <div
            className={cn("backdrop-blur-md rounded-md border select-none", {
                "bg-accent-positive/70 border-accent-positive text-white":
                    type === "success",
                "bg-negative/70 border-negative text-white": type === "error",
                "bg-info/70 border-info text-white": type === "info",
                "bg-warning/70 border-warning text-white": type === "warning",
            })}
        >
            <div className="flex items-center gap-1.5 px-3 py-2">
                <ToastIcon type={type} />
                <span>{message}</span>
            </div>
        </div>
    );
}

export default Toast;
