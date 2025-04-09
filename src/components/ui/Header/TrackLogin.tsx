"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function TrackLogin() {
    const { consent } = useCookieConsent();

    useEffect(() => {
        if (consent.analytics) {
            const accountName = localStorage.getItem("accountName");
            track("User Sign-In Status", { signedIn: !!accountName });
        }
    });

    return null;
}
