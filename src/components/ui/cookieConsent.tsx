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
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function CookieConsent() {
    const { consent, setConsent, hasInteracted, setInteracted } =
        useCookieConsent();

    if (
        process.env.NODE_ENV === "development" ||
        hasInteracted ||
        window.location.hostname === "localhost"
    )
        return null;

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

    return (
        <Dialog open={!hasInteracted} onOpenChange={() => {}}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cookie Preferences</DialogTitle>
                    <DialogDescription>
                        We use cookies to enhance your browsing experience and
                        analyze our traffic.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Necessary</p>
                            <p className="text-sm text-muted-foreground">
                                Required for basic site functionality
                            </p>
                        </div>
                        <Switch checked disabled />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Functional</p>
                            <p className="text-sm text-muted-foreground">
                                For saving your preferences
                            </p>
                        </div>
                        <Switch
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
                                Help us improve by collecting anonymous usage
                                data
                            </p>
                        </div>
                        <Switch
                            checked={consent.analytics}
                            onCheckedChange={(checked) =>
                                setConsent("analytics", checked)
                            }
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleRejectAll}>
                        Reject All
                    </Button>
                    <Button variant="secondary" onClick={handleSavePreferences}>
                        Save Preferences
                    </Button>
                    <Button onClick={handleAcceptAll}>Accept All</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
