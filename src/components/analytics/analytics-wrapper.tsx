"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { useUser } from "@/contexts/user-context";
import { useDevice } from "@/contexts/device-context";

export function AnalyticsWrapper() {
    const { consent } = useCookieConsent();
    const { user, isLoading } = useUser();
    const device = useDevice();
    const domain = process.env.NEXT_PUBLIC_HOST;
    const endpoint = process.env.NEXT_PUBLIC_PLAUSIBLE_ENDPOINT;

    useEffect(() => {
        const loadAndInit = async () => {
            if (!domain) {
                console.warn("Plausible URL not set in environment variables.");
                return;
            }
            if (!endpoint) {
                console.warn(
                    "Plausible endpoint not set in environment variables."
                );
                return;
            }

            if (!consent.analytics) return;
            if (isLoading) return;

            const { init } = await import("@plausible-analytics/tracker");

            init({
                domain: domain,
                endpoint: endpoint,
                outboundLinks: true,
                customProperties: {
                    logged_in: (!!user).toString(),
                    pwa: device.isPWA.toString(),
                },
            });
        };

        loadAndInit();
    }, [domain, endpoint, consent.analytics, user, device, isLoading]);

    return null;
}
