"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { useBorderColor } from "@/contexts/border-color-context";
import { ErrorProvider } from "@/contexts/error-context";
import { useUser } from "@/hooks/use-user";
import { fetchNotification } from "@/lib/manga/bookmarks";
import { useShortcutSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { BaseSidebarContent } from "./base/sidebar-content";
import { HeaderComponent } from "./header";
import { PullToRefresh } from "./pull-to-refresh";

export function BaseLayout({
    children,
    gutter,
}: {
    children: React.ReactNode;
    gutter?: boolean;
}) {
    const router = useRouter();
    const { data: user } = useUser();
    const { borderClass } = useBorderColor();

    const { data: notification = "" } = useQuery({
        queryKey: ["notification"],
        queryFn: fetchNotification,
        enabled: !!user,
    });

    // Trigger a router refresh and wait until the client network activity
    // that follows has become idle for a short period. This avoids relying
    // on DOM mutation observers or server layout changes.
    const handleRefresh = async (): Promise<void> => {
        if (typeof window === "undefined") {
            router.refresh();
            return;
        }

        const waitForNetworkIdle = (timeout: number, idleMs: number) =>
            new Promise<void>((resolve) => {
                const originalFetch = window.fetch.bind(window);
                type Win = Window & { fetch: typeof fetch };
                const win = window as Win;
                let inFlight = 0;
                let idleTimer: number | null = null;
                let finished = false;

                const cleanup = () => {
                    if (idleTimer) {
                        clearTimeout(idleTimer);
                        idleTimer = null;
                    }
                    win.fetch = originalFetch;
                };

                const finish = () => {
                    if (finished) return;
                    finished = true;
                    cleanup();
                    resolve();
                };

                const shouldTrack = (input: RequestInfo | URL) => {
                    try {
                        const url = new URL(
                            typeof input === "string"
                                ? input
                                : (input as Request).url || String(input),
                            location.href,
                        );
                        // only track same-origin requests to avoid counting analytics/3rd-party
                        return (
                            url.origin === location.origin &&
                            url.search.includes("?_rsc")
                        );
                    } catch {
                        return false;
                    }
                };

                // short-lived fetch wrapper to count same-origin requests that start
                win.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
                    const track = shouldTrack(input);
                    if (track) inFlight++;

                    const p = originalFetch(
                        input as RequestInfo,
                        init as RequestInit,
                    );

                    p.finally(() => {
                        if (track) {
                            console.debug("fetch finished:", input);
                            inFlight = Math.max(0, inFlight - 1);
                            if (inFlight === 0) {
                                if (idleTimer) clearTimeout(idleTimer);
                                idleTimer = window.setTimeout(finish, idleMs);
                            }
                        }
                    });

                    return p;
                };

                // if nothing tracked starts, resolve after idleMs
                idleTimer = window.setTimeout(finish, idleMs);

                // absolute fallback
                window.setTimeout(finish, timeout);
            });

        const networkPromise = waitForNetworkIdle(3000, 500);
        router.refresh();
        await networkPromise;
    };

    const handleSettingsClick = () => {
        router.push("/settings");
    };

    useShortcutSetting("openSettings", handleSettingsClick, {
        preventDefault: true,
    });
    useShortcutSetting(
        "navigateBookmarks",
        () => {
            router.push("/bookmarks");
        },
        { preventDefault: true },
    );

    return (
        <div className="flex flex-col w-full" data-vaul-drawer-wrapper>
            <Suspense
                fallback={<div className="h-14 md:h-10 bg-sidebar border-b" />}
            >
                <HeaderComponent notification={notification} />
            </Suspense>
            <div className="bg-background md:bg-sidebar flex flex-1 h-full">
                <Sidebar collapsible="icon" aria-label="Main navigation">
                    <Suspense fallback={<div className="w-4" />}>
                        <BaseSidebarContent notification={notification} />
                    </Suspense>
                </Sidebar>
                <PullToRefresh
                    as="main"
                    onRefresh={handleRefresh}
                    className={cn(
                        "bg-background min-h-[var(--visible-height)] md:min-h-none h-full w-full flex flex-col md:border-t md:rounded-tl-xl md:border-l md:overflow-y-auto",
                        borderClass,
                    )}
                    style={{ scrollbarGutter: gutter ? "stable" : "auto" }}
                    id="scroll-element"
                >
                    <Suspense fallback={children}>
                        <ErrorProvider>{children}</ErrorProvider>
                    </Suspense>
                </PullToRefresh>
            </div>
        </div>
    );
}
