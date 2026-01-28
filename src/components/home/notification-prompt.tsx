"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { registerAndSubscribe } from "@/lib/notifications/subscribe";
import { useStorage } from "@/lib/storage";

export function NotificationPrompt() {
    const { user } = useUser();
    const [isVisible, setIsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const storage = useStorage("pushNotifications");

    useEffect(() => {
        const data = storage.get();
        if (data?.declined || data?.enabled) {
            setIsVisible(false);
            return;
        }

        // Only show the prompt when the user is signed in
        if (!user) {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
    }, [user, storage]);

    const handleDecline = () => {
        storage.update({ declined: true });
        setIsVisible(false);
    };

    const handleEnable = async () => {
        setIsProcessing(true);
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

        try {
            const result = await registerAndSubscribe(vapidKey);

            if (result.status === "subscribed") {
                storage.update({ enabled: true, pending: false });
                setIsVisible(false);
            } else if (result.status === "pending") {
                storage.update({ pending: true });
                setIsVisible(false);
            } else {
                setIsVisible(false);
            }
        } catch (err: unknown) {
            // If permission was denied inside the handler, record it and stop showing
            const message = err instanceof Error ? err.message : String(err);
            console.log("Push notification setup failed:", message);
            if (message.includes("Permission denied")) {
                storage.update({ declined: true });
                setIsVisible(false);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="bg-background border rounded-lg p-4 shadow-lg w-full sm:max-w-sm">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">Enable Notifications</h3>
                <button
                    onClick={handleDecline}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close notification prompt"
                >
                    <X size={20} />
                </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
                Would you like to receive push notifications for new chapters?
            </p>
            <div className="flex gap-2">
                <Button onClick={handleEnable} disabled={isProcessing}>
                    Enable Notifications
                </Button>
                <Button variant="ghost" onClick={handleDecline}>
                    No thanks
                </Button>
            </div>
        </div>
    );
}
