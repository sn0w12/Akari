import React from "react";
import { useToast, ToastPosition } from "./ToastContext";
import { ToastItem } from "./ToastItem";
import { cn } from "@/lib/utils";

export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    // Group toasts by position
    const groupedToasts = toasts.reduce<Record<ToastPosition, typeof toasts>>(
        (acc, toast) => {
            const position = toast.options.position || "top-right";
            if (!acc[position]) {
                acc[position] = [];
            }
            acc[position].push(toast);
            return acc;
        },
        {} as Record<ToastPosition, typeof toasts>,
    );

    const positionClasses: Record<ToastPosition, string> = {
        "top-right": "top-0 right-0",
        "top-center": "top-0",
        "top-left": "top-0 left-0",
        "bottom-right": "bottom-0 right-0",
        "bottom-center": "bottom-0",
        "bottom-left": "bottom-0 left-0",
    };

    // Inline styles for center positions
    const getPositionStyle = (position: ToastPosition): React.CSSProperties => {
        if (position === "top-center" || position === "bottom-center") {
            return { left: "50%", transform: "translateX(-50%)" };
        }
        return {};
    };

    return (
        <>
            {(Object.keys(groupedToasts) as ToastPosition[]).map((position) => (
                <div
                    key={position}
                    className={cn(
                        "fixed z-50 flex p-4 gap-2 max-w-md w-full",
                        position.includes("bottom")
                            ? "flex-col-reverse"
                            : "flex-col",
                        positionClasses[position],
                    )}
                    style={getPositionStyle(position)}
                >
                    <div className="toast-container flex flex-col gap-2">
                        {groupedToasts[position].map((toast) => (
                            <ToastItem key={toast.id} toast={toast} />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
};
