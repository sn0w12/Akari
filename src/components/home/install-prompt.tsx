"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { X, Share, Plus, MoreHorizontal } from "lucide-react";
import { useDevice } from "@/contexts/device-context";

export function InstallPrompt() {
    const { deviceType } = useDevice();
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                !(window as any).MSStream
        );

        setIsAndroid(/Android/.test(navigator.userAgent));

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
        <div className="bg-background border rounded-lg p-4 shadow-lg w-full sm:max-w-sm">
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
            {isIOS ? (
                <p className="text-sm text-muted-foreground">
                    To install this app on your iOS device, tap the share button{" "}
                    <Share size={16} className="inline" /> and then "Add to Home
                    Screen" <Plus size={16} className="inline" />.
                </p>
            ) : isAndroid ? (
                <p className="text-sm text-muted-foreground">
                    To install this app on your Android device, tap the menu
                    button <MoreHorizontal size={16} className="inline" /> and
                    select "Add to Home screen".
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    To install this app, add it to your home screen.
                </p>
            )}
        </div>
    );
}
