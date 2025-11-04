"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useDevice } from "@/contexts/device-context";

export function InstallPrompt() {
    const { deviceType } = useDevice();
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                !(window as any).MSStream
        );

        setIsStandalone(
            window.matchMedia("(display-mode: standalone)").matches
        );

        if (localStorage.getItem("installPromptDismissed") === "true") {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("installPromptDismissed", "true");
        setIsVisible(false);
    };

    if (isStandalone || !isVisible || deviceType !== "mobile") {
        return null;
    }

    return (
        <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto bg-background border rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">Install App</h3>
                <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close install prompt"
                >
                    <X size={20} />
                </button>
            </div>
            <Button>Add to Home Screen</Button>
            {isIOS && (
                <p className="text-sm text-muted-foreground">
                    To install this app on your iOS device, tap the share button
                    <span role="img" aria-label="share icon">
                        {" "}
                        ⎋{" "}
                    </span>
                    and then "Add to Home Screen"
                    <span role="img" aria-label="plus icon">
                        {" "}
                        ➕{" "}
                    </span>
                    .
                </p>
            )}
        </div>
    );
}
