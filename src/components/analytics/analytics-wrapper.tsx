"use client";

import { useCookieConsent } from "@/hooks/use-cookie-consent";
import Script from "next/script";

export function AnalyticsWrapper() {
    const { consent } = useCookieConsent();

    return (
        <>
            {consent.analytics && (
                <Script
                    defer
                    src="https://cloud.umami.is/script.js"
                    data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                    data-exclude-search="true"
                    strategy="afterInteractive"
                />
            )}
        </>
    );
}
