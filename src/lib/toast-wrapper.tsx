"use client";

import { toast } from "sonner";
import { getSetting } from "./settings";

/**
 * A wrapper class for handling toast notifications with customizable options.
 * Integrates with Sonner toast notification system and respects user preferences for displaying notifications.
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
 * @method close - Dismisses all active toast notifications
 *
 * @example
 * const toast = new Toast("Operation successful", "success");
 * // Later...
 * toast.close();
 */
class Toast {
    constructor(
        message: string,
        type: "success" | "error" | "info" | "warning",
        options = {}
    ) {
        const showToast = getSetting("useToast");
        if (!showToast) return;

        const { autoClose, ...restOptions } = options as {
            autoClose?: number;
            [key: string]: unknown;
        };
        const toastOptions = {
            duration: autoClose ?? 5000,
            ...restOptions,
        };

        toast[type](message, toastOptions);
    }

    close() {
        toast.dismiss();
    }
}

export default Toast;
