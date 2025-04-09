"use client";

import { useEffect } from "react";
import { useToast } from "./toast/ToastContext";
import { ToastContextType, ToastPosition } from "./toast/ToastContext";

// Utility function to get the user's theme
const getUserTheme = (): "light" | "dark" => {
    return (localStorage.getItem("theme") as "dark") || "dark";
};

/**
 * A wrapper class for handling toast notifications with customizable options.
 * Integrates with a custom toast notification system and respects user preferences for displaying notifications.
 *
 * @class Toast
 *
 * @constructor
 * @param {string} message - The message to display in the toast notification
 * @param {"success" | "error" | "info" | "warning"} type - The type of toast notification to display
 * @param {Object} [options={}] - Optional configuration options for the toast notification
 * @param {number} [options.autoClose=5000] - Auto close duration in ms (0 to disable)
 * @param {boolean} [options.closeOnClick=true] - Close the toast when clicked
 * @param {boolean} [options.pauseOnHover=true] - Pause the timer when hovering the toast
 * @param {boolean} [options.pauseOnFocusLoss=true] - Pause the toast when the window loses focus
 * @param {boolean} [options.draggable=true] - Allow toast to be dragged
 * @param {number} [options.delay=0] - Add a delay before the toast appears
 *
 * @method close - Dismisses the active toast notification
 *
 * @example
 * const toast = new Toast("Operation successful", "success");
 * // Later...
 * toast.close();
 */
class Toast {
    private toastId: string = "toast";
    private theme: "light" | "dark" = "dark";
    private showToast: boolean;
    private static toastManager: ToastContextType | null = null;

    constructor(
        message: string,
        type: "success" | "error" | "info" | "warning",
        options = {},
    ) {
        this.showToast =
            JSON.parse(localStorage.getItem("settings") || "{}").useToast !=
            false;
        if (!this.showToast) return;

        this.theme = getUserTheme();

        // We'll update the toastId when the toast is actually shown
        this.show(message, type, options);
    }

    // Method to initialize the toast manager (to be called from the component that has access to the hook)
    static initToastManager(manager: ToastContextType) {
        Toast.toastManager = manager;
    }

    private show(
        message: string,
        type: "success" | "error" | "info" | "warning",
        options = {},
    ) {
        if (!Toast.toastManager) {
            // In case we try to use toast before the manager is initialized,
            // we can fallback to console or queue the toasts
            console.warn(
                "Toast manager not initialized. Toast message:",
                message,
            );
            return;
        }

        const defaultOptions = {
            position: "top-right" as ToastPosition,
            theme: this.theme,
            autoClose: 5000,
            ...options,
        };

        // Use the custom toast manager to show the toast
        this.toastId = Toast.toastManager.addToast(
            message,
            type,
            defaultOptions,
        );
    }

    close() {
        if (this.toastId && Toast.toastManager) {
            Toast.toastManager.removeToast(this.toastId);
        }
    }
}

export default Toast;

// Hook wrapper to initialize Toast with the toast manager
export function useToastInitializer() {
    const toastManager = useToast();

    useEffect(() => {
        Toast.initToastManager(toastManager);
    }, [toastManager]);
}
