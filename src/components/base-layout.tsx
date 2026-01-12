"use client";

import { Suspense } from "react";
import {
    BadgeAlert,
    Bookmark,
    BookType,
    FolderIcon,
    HomeIcon,
    Mountain,
    SettingsIcon,
    Theater,
    TrendingUp,
    Users,
} from "lucide-react";
import { HeaderComponent } from "./header";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuLink,
    SidebarMenuItem,
    SidebarSection,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { GENRE_CATEGORIES } from "@/lib/api/search";
import { fetchNotification } from "@/lib/manga/bookmarks";
import { useShortcutSetting, useSetting } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { KeyboardShortcut } from "./ui/keyboard-shortcut";
import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { AccountButton } from "./account/account-button";
import { cn } from "@/lib/utils";
import { useBorderColor } from "@/contexts/border-color-context";

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
        <div className="flex flex-col w-full">
            <Suspense
                fallback={<div className="h-12 md:h-10 bg-sidebar border-b" />}
            >
                <HeaderComponent notification={notification} />
            </Suspense>
            <div className="bg-sidebar flex flex-1">
                <Sidebar collapsible="icon" aria-label="Main navigation">
                    <SidebarContent data-scrollbar-custom="true">
                        <SidebarMenu className="p-2 pt-3">
                            <Separator className="hidden md:block" />

                            <SidebarMenuItem>
                                <SidebarMenuLink tooltip="Home" href="/">
                                    <HomeIcon />
                                    <span>Home</span>
                                </SidebarMenuLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuLink
                                    tooltip={`Bookmarks${
                                        notification ? " •" : ""
                                    } ${notification}`}
                                    href="/bookmarks"
                                    aria-label={`${notification} Unread Bookmarks`}
                                >
                                    <Bookmark />
                                    <span>Bookmarks</span>
                                    <KeyboardShortcut
                                        keys={useSetting("navigateBookmarks")}
                                        className={`gap-1 ${
                                            isSidebarCollapsed
                                                ? "opacity-0"
                                                : "transition-opacity transition-duration-200 opacity-100"
                                        }`}
                                    />
                                </SidebarMenuLink>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuLink
                                    tooltip="Popular"
                                    href="/popular"
                                >
                                    <TrendingUp />
                                    <span>Popular</span>
                                </SidebarMenuLink>
                            </SidebarMenuItem>

                            <Separator />

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
                                        isSidebarCollapsed={isSidebarCollapsed}
                                        basePath="/genre"
                                        isActive={false}
                                        onNavigate={() => {}}
                                        isItemActive={() => false}
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
                                    className={`gap-1 transition-opacity transition-duration-200 ${
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
                <main
                    className={cn(
                        `bg-background flex flex-col flex-1 md:border-t md:rounded-tl-xl md:border-l md:overflow-y-auto w-full`,
                        borderClass,
                    )}
                    style={{ scrollbarGutter: gutter ? "stable" : "auto" }}
                    id="scroll-element"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
