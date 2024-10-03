import { toast } from 'react-toastify';

// Utility function to get the user's theme
const getUserTheme = (): "light" | "dark" => {
  return localStorage.getItem("theme") as "dark" || "light";
};

class Toast {
  private toastId: string = "toast";
  private theme: "light" | "dark" = "dark";
  private showToast: boolean;

  constructor(message: string, type: "success" | "error" | "info" | "warning", options = {}) {
    this.showToast = JSON.parse(localStorage.getItem("settings") || '{}').useToast != false;
    if (!this.showToast) return;

    this.theme = getUserTheme();
    this.toastId = `toast-${Math.random().toString(36).substr(2, 9)}`; // Generate a custom ID

    this.show(message, type, options);
  }

  private show(message: string, type: "success" | "error" | "info" | "warning", options = {}) {
    const defaultOptions = {
      position: "top-right" as "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left",
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