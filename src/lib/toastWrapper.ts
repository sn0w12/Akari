import { toast } from "react-toastify";

// Utility function to get the user's theme
const getUserTheme = (): "light" | "dark" => {
    return (localStorage.getItem("theme") as "dark") || "dark";
};

/**
 * A wrapper class for handling toast notifications with customizable options.
 * Integrates with a toast notification system and respects user preferences for displaying notifications.
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
        this.toastId = `toast-${Math.random().toString(36).substr(2, 9)}`; // Generate a custom ID

        this.show(message, type, options);
    }

    private show(
        message: string,
        type: "success" | "error" | "info" | "warning",
        options = {},
    ) {
        const defaultOptions = {
            position: "top-right" as
                | "top-right"
                | "top-center"
                | "top-left"
                | "bottom-right"
                | "bottom-center"
                | "bottom-left",
            theme: this.theme,
            autoClose: 5000,
            toastId: this.toastId,
            ...options,
        };

        switch (type) {
            case "success":
                toast.success(message, defaultOptions);
                break;
            case "error":
                toast.error(message, defaultOptions);
                break;
            case "info":
                toast.info(message, defaultOptions);
                break;
            case "warning":
                toast.warning(message, defaultOptions);
                break;
            default:
                toast(message, defaultOptions);
        }
    }

    close() {
        console.log(this.toastId);
        toast.dismiss(this.toastId);
    }
}

export default Toast;
