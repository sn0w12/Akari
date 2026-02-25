"use client";

import { useDevice } from "@/contexts/device-context";
import { useUser } from "@/hooks/use-user";
import { useSetting } from "@/lib/settings";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type PathPattern = {
    regex: RegExp;
    replacement: string;
};

const pathPatterns: PathPattern[] = [
    {
        regex: /^\/manga\/[a-f0-9-]{36}$/,
        replacement: "/manga/{id}",
    },
    {
        regex: /^\/manga\/[a-f0-9-]{36}\/[0-9]+$/,
        replacement: "/manga/{id}/{chapter}",
    },
    {
        regex: /^\/genre\/[^\/]+$/,
        replacement: "/genre/{name}",
    },
    {
        regex: /^\/author\/[^\/]+$/,
        replacement: "/author/{name}",
    },
    {
        regex: /^\/user\/[a-f0-9-]{36}$/,
        replacement: "/user/{id}",
    },
    {
        regex: /^\/lists\/[a-f0-9-]{36}$/,
        replacement: "/lists/{id}",
    },
];

export function generalizePathname(pathname: string): string {
    for (const { regex, replacement } of pathPatterns) {
        if (regex.test(pathname)) {
            return replacement;
        }
    }
    return pathname; // Return original if no match
}

export function AnalyticsWrapper() {
    const { data: user, isLoading } = useUser();
    const allowAnalytics = useSetting("allowAnalytics");
    const pathname = usePathname();
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
                    "Plausible endpoint not set in environment variables.",
                );
                return;
            }

            if (!allowAnalytics) return;
            if (isLoading) return;

            const { init } = await import("@plausible-analytics/tracker");

            init({
                domain: domain,
                endpoint: endpoint,
                outboundLinks: true,
                customProperties: {
                    logged_in: (!!user).toString(),
                    pwa: device.isPWA.toString(),
                    general_path: generalizePathname(pathname),
                },
            });
        };

        loadAndInit();
    }, [domain, endpoint, allowAnalytics, user, device, isLoading, pathname]);

    return null;
}
