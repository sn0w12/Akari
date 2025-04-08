"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import Script from "next/script";

export function AnalyticsWrapper() {
    const { consent } = useCookieConsent();

    return (
        <>
            {consent.analytics && (
                <Script
                    defer
                    src="https://cloud.umami.is/script.js"
                    data-website-id="53600aa5-bffc-4e98-8f78-2351d1206043"
                    data-exclude-search="true"
                    strategy="afterInteractive"
                />
            )}
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
