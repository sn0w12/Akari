"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function AnalyticsWrapper() {
    const { consent } = useCookieConsent();

    if (!consent.analytics) {
        return null;
    }

    return (
        <>
            <Analytics
                beforeSend={(event) => {
                    if (!consent.analytics) {
                        return null;
                    }
                    return event;
                }}
            />
            <SpeedInsights
                beforeSend={(event) => {
                    if (!consent.analytics) {
                        return null;
                    }
                    return event;
                }}
            />
        </>
    );
}
