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
import { useEffect, useState } from "react";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "./tooltip";

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
                            Help us improve by collecting anonymous usage data
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
    const { consent, setConsent, hasInteracted, setInteracted } =
        useCookieConsent();

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
    }, []);

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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setOpen(true)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                                <path d="M8.5 8.5v.01" />
                                <path d="M16 15.5v.01" />
                                <path d="M12 12v.01" />
                                <path d="M11 17v.01" />
                                <path d="M7 14v.01" />
                            </svg>
                            <span className="sr-only">Cookie Preferences</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Manage cookie preferences</TooltipContent>
                </Tooltip>
            </TooltipProvider>

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
