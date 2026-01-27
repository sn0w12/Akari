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
import { useUser } from "@/contexts/user-context";
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
    const { user } = useUser();
    const { state: sidebarState } = useSidebar();
    const { borderClass } = useBorderColor();
    const isSidebarCollapsed = sidebarState === "collapsed";

    const { data: notification = "" } = useQuery({
        queryKey: ["notification"],
        queryFn: fetchNotification,
        enabled: !!user,
    });

    const handleRefresh = async (): Promise<void> => {
        router.refresh();
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
        <div
            className="flex flex-col w-full standalone:mt-8"
            data-vaul-drawer-wrapper
        >
            <Suspense
                fallback={<div className="h-14 md:h-10 bg-sidebar border-b" />}
            >
                <HeaderComponent notification={notification} />
            </Suspense>
            <div className="bg-sidebar flex flex-1">
                <Sidebar collapsible="icon" aria-label="Main navigation">
                    <SidebarContent
                        data-scrollbar-custom="true"
                        className="standalone:mt-8"
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
                    <SidebarFooter className="standalone:mb-4">
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
                        "bg-background flex flex-col flex-1 mb-14 md:mb-0 md:border-t md:rounded-tl-xl md:border-l md:overflow-y-auto w-full",
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
