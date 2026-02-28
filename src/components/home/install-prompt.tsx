"use client";

import { useDevice } from "@/contexts/device-context";
import { useStorage } from "@/lib/storage";
import { MoreHorizontal, Plus, Share } from "lucide-react";
import { useState } from "react";
import {
    Prompt,
    PromptContent,
    PromptHeader,
    PromptTitle,
} from "../ui/prompt-stack";

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
        <Prompt>
            <PromptHeader onDecline={handleClose}>
                <PromptTitle>Install App</PromptTitle>
            </PromptHeader>
            <PromptContent>
                {os === "iOS" ? (
                    <>
                        To install this app on your iOS device, tap the share
                        button <Share size={16} className="inline" /> and then
                        &quot;Add to Home Screen&quot;{" "}
                        <Plus size={16} className="inline" />.
                    </>
                ) : os === "Android" ? (
                    <>
                        To install this app on your Android device, tap the menu
                        button <MoreHorizontal size={16} className="inline" />{" "}
                        and select &quot;Add to Home screen&quot;.
                    </>
                ) : (
                    <>To install this app, add it to your home screen.</>
                )}
            </PromptContent>
        </Prompt>
    );
}
