import { useDevice } from "@/contexts/device-context";
import { useUser } from "@/hooks/use-user";
import { env } from "@/lib/env";
import { useSetting } from "@/lib/settings";
import { useRouterState } from "@tanstack/react-router";
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
    regex: /^\/genre\/[^/]+$/,
    replacement: "/genre/{name}",
  },
  {
    regex: /^\/author\/[^/]+$/,
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

let analyticsInitialized = false;

export function AnalyticsWrapper() {
  const { data: user, isLoading } = useUser();
  const allowAnalytics = useSetting("allowAnalytics");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const device = useDevice();
  const domain = env("VITE_HOST");
  const endpoint = env("VITE_PLAUSIBLE_ENDPOINT");

  useEffect(() => {
    const loadAndInit = async () => {
      if (analyticsInitialized) {
        // already done, nothing to do
        return;
      }

      if (!domain) {
        console.warn("Plausible URL not set in environment variables.");
        return;
      }
      if (!endpoint) {
        console.warn("Plausible endpoint not set in environment variables.");
        return;
      }

      if (!allowAnalytics) return;
      if (isLoading) return;

      const { init } = await import("@plausible-analytics/tracker");

      try {
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
        analyticsInitialized = true;
      } catch (error) {
        console.error("Failed to initialize Plausible analytics:", error);
      }
    };

    void loadAndInit();
  }, [domain, endpoint, allowAnalytics, user, device, isLoading, pathname]);

  return null;
}
