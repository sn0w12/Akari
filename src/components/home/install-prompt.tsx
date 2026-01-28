"use client";

import { useDevice } from "@/contexts/device-context";
import { useStorage } from "@/lib/storage";
import { MoreHorizontal, Plus, Share, X } from "lucide-react";
import { useState } from "react";

export function InstallPrompt() {
    const { deviceType, os, isPWA } = useDevice();
    const installPromptStorage = useStorage("installPromptDismissed");
    const [isVisible, setIsVisible] = useState<boolean>(
        () => !installPromptStorage.get()?.dismissed,
    );

    const handleClose = () => {
        installPromptStorage.set({ dismissed: true });
        setIsVisible(false);
    };

    if (isPWA || !isVisible || deviceType !== "mobile") {
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
            {os === "iOS" ? (
                <p className="text-sm text-muted-foreground">
                    To install this app on your iOS device, tap the share button{" "}
                    <Share size={16} className="inline" /> and then &quot;Add to
                    Home Screen&quot; <Plus size={16} className="inline" />.
                </p>
            ) : os === "Android" ? (
                <p className="text-sm text-muted-foreground">
                    To install this app on your Android device, tap the menu
                    button <MoreHorizontal size={16} className="inline" /> and
                    select &quot;Add to Home screen&quot;.
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    To install this app, add it to your home screen.
                </p>
            )}
        </div>
    );
}
