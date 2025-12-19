"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { useEffect, useState } from "react";

function CookieConsentBody({
    onAcceptAll,
    onRejectAll,
    onSavePreferences,
}: {
    onAcceptAll?: () => void;
    onRejectAll?: () => void;
    onSavePreferences?: () => void;
}) {
    const { consent, setConsent } = useCookieConsent();

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Necessary</p>
                        <p className="text-sm text-muted-foreground">
                            Required for basic site functionality
                        </p>
                    </div>
                    <Switch
                        aria-label="Necessary Cookies, cannot be disabled"
                        checked
                        disabled
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Functional</p>
                        <p className="text-sm text-muted-foreground">
                            For saving your preferences
                        </p>
                    </div>
                    <Switch
                        aria-label="Functional Cookies"
                        checked={consent.functional}
                        onCheckedChange={(checked) =>
                            setConsent("functional", checked)
                        }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Analytics</p>
                        <p className="text-sm text-muted-foreground">
                            Help us improve by collecting anonymous usage data
                        </p>
                    </div>
                    <Switch
                        aria-label="Analytics Cookies"
                        checked={consent.analytics}
                        disabled={window.location.hostname === "localhost"}
                        onCheckedChange={(checked) =>
                            setConsent("analytics", checked)
                        }
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
                {onRejectAll && (
                    <Button variant="outline" onClick={onRejectAll}>
                        Reject All
                    </Button>
                )}
                {onSavePreferences && (
                    <Button variant="secondary" onClick={onSavePreferences}>
                        Save Preferences
                    </Button>
                )}
                {onAcceptAll && (
                    <Button onClick={onAcceptAll}>Accept All</Button>
                )}
            </div>
        </>
    );
}

export function CookieConsent() {
    const { setConsent, hasInteracted, setInteracted } = useCookieConsent();

    useEffect(() => {
        const isLocalEnv =
            window.location.hostname === "localhost" ||
            process.env.NODE_ENV === "development";

        if (isLocalEnv && !hasInteracted) {
            setConsent("necessary", true);
            setConsent("functional", true);
            setConsent("analytics", false);
            setInteracted();
        }
    }, [setConsent, setInteracted, hasInteracted]);

    const handleAcceptAll = () => {
        setConsent("necessary", true);
        setConsent("functional", true);
        setConsent("analytics", true);
        setInteracted();
    };

    const handleRejectAll = () => {
        setConsent("necessary", true); // Necessary cookies always enabled
        setConsent("functional", false);
        setConsent("analytics", false);
        setInteracted();
    };

    const handleSavePreferences = () => {
        // Keep current selections and mark as interacted
        setInteracted();
    };

    if (hasInteracted) return null;

    return (
        <Dialog open={!hasInteracted} onOpenChange={() => {}}>
            <DialogContent>
                <DialogHeader className="border-b pb-4">
                    <DialogTitle>Cookie Preferences</DialogTitle>
                    <DialogDescription>
                        We use cookies to enhance your browsing experience and
                        analyze our traffic.
                    </DialogDescription>
                </DialogHeader>
                <CookieConsentBody
                    onAcceptAll={handleAcceptAll}
                    onRejectAll={handleRejectAll}
                    onSavePreferences={handleSavePreferences}
                />
            </DialogContent>
        </Dialog>
    );
}

export function CookieConsentFooter() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-muted-foreground hover:text-ring pointer-cursor"
            >
                Cookies
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle>Cookie Preferences</DialogTitle>
                        <DialogDescription>
                            We use cookies to enhance your browsing experience
                            and analyze our traffic.
                        </DialogDescription>
                    </DialogHeader>
                    <CookieConsentBody />
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setOpen(false)}>
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
