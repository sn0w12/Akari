"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuLink,
    SidebarSection,
    useSidebar,
} from "@/components/ui/sidebar";
import { useBorderColor } from "@/contexts/border-color-context";
import { useUser } from "@/hooks/use-user";
import { GENRE_CATEGORIES } from "@/lib/api/search";
import { fetchNotification } from "@/lib/manga/bookmarks";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
    BadgeAlert,
    Bookmark,
    BookType,
    FolderIcon,
    HomeIcon,
    Mountain,
    Search,
    SettingsIcon,
    Theater,
    TrendingUp,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { AccountButton } from "./account/account-button";
import { HeaderComponent } from "./header";
import { PullToRefresh } from "./pull-to-refresh";
import { KeyboardShortcut } from "./ui/keyboard-shortcut";
import { Separator } from "./ui/separator";

const categoryIcons: Record<string, React.ReactNode> = {
    Demographics: <Users />,
    Format: <BookType />,
    Genres: <Theater />,
    Themes: <Mountain />,
    Mature: <BadgeAlert />,
};

export function BaseLayout({
    children,
    gutter,
}: {
    children: React.ReactNode;
    gutter?: boolean;
}) {
    const router = useRouter();
    const { data: user } = useUser();
    const { state: sidebarState } = useSidebar();
    const { borderClass } = useBorderColor();
    const isSidebarCollapsed = sidebarState === "collapsed";

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

        const waitForNetworkIdle = (timeout = 3000, idleMs = 120) =>
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
                        return url.origin === location.origin;
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

        const networkPromise = waitForNetworkIdle(3000, 120);
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
                    <SidebarContent
                        data-scrollbar-custom="true"
                        className="mt-[var(--safe-top)] md:mt-0"
                    >
                        <SidebarMenu className="p-2 pt-3 gap-0.5">
                            <Separator className="hidden md:block" />

                            <SidebarMenuItem className="hidden md:block">
                                <SidebarMenuLink tooltip="Home" href="/">
                                    <HomeIcon />
                                    <span>Home</span>
                                </SidebarMenuLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="hidden md:block">
                                <SidebarMenuLink
                                    tooltip={`Bookmarks${
                                        notification ? " •" : ""
                                    } ${notification}`}
                                    href="/bookmarks"
                                    aria-label={`${notification} Unread Bookmarks`}
                                    prefetch={false}
                                >
                                    <Bookmark />
                                    <span>Bookmarks</span>
                                    <KeyboardShortcut
                                        keys={useSetting("navigateBookmarks")}
                                        className={`transition-opacity ease-snappy ${
                                            isSidebarCollapsed
                                                ? "opacity-0"
                                                : "opacity-100"
                                        }`}
                                    />
                                </SidebarMenuLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="hidden md:block">
                                <SidebarMenuLink
                                    tooltip="Popular"
                                    href="/popular"
                                >
                                    <TrendingUp />
                                    <span>Popular</span>
                                </SidebarMenuLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="hidden md:block">
                                <SidebarMenuLink
                                    tooltip="Search"
                                    href="/search"
                                >
                                    <Search />
                                    <span>Search</span>
                                </SidebarMenuLink>
                            </SidebarMenuItem>

                            <Separator className="hidden md:block" />

                            {Object.entries(GENRE_CATEGORIES).map(
                                ([category, genres]) => (
                                    <SidebarSection
                                        key={category}
                                        title={category}
                                        icon={
                                            categoryIcons[category] || (
                                                <FolderIcon />
                                            )
                                        }
                                        items={genres.map((genre) => ({
                                            name: genre,
                                            id: genre,
                                        }))}
                                        basePath="/genre"
                                        isActive={false}
                                        isItemActive={(): boolean => false}
                                    />
                                ),
                            )}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="mb-[var(--safe-bottom)] md:mb-0">
                        <Separator />
                        <SidebarMenuItem>
                            <SidebarMenuLink
                                tooltip="Settings"
                                href="/settings"
                            >
                                <SettingsIcon />
                                <span>Settings</span>
                                <KeyboardShortcut
                                    keys={useSetting("openSettings")}
                                    className={`transition-opacity ease-snappy ${
                                        isSidebarCollapsed
                                            ? "opacity-0"
                                            : "opacity-100"
                                    }`}
                                />
                            </SidebarMenuLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <AccountButton
                                sidebarCollapsed={isSidebarCollapsed}
                            />
                        </SidebarMenuItem>
                    </SidebarFooter>
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
                    {children}
                </PullToRefresh>
            </div>
        </div>
    );
}
