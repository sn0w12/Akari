"use client";

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
    User,
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
import { useEffect, useState } from "react";
import { useShortcutSetting, useSetting } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { KeyboardShortcut } from "./ui/keyboard-shortcut";

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
    const [notification, setNotification] = useState<string>("");
    const { state: sidebarState } = useSidebar();
    const isSidebarCollapsed = sidebarState === "collapsed";

    const handleSettingsClick = () => {
        router.push("/settings");
    };

    useShortcutSetting("openSettings", handleSettingsClick, {
        preventDefault: true,
    });
    useShortcutSetting("openAccount", () => router.push("/account"), {
        preventDefault: true,
    });
    useShortcutSetting(
        "navigateBookmarks",
        () => {
            router.push("/bookmarks");
        },
        { preventDefault: true }
    );

    useEffect(() => {
        fetchNotification().then((value) => {
            setNotification(value);
        });
    }, [setNotification]);

    return (
        <div className="flex flex-col w-full">
            <HeaderComponent />
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
                                    data-no-prefetch
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
                                )
                            )}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <Separator />
                        <SidebarMenuItem>
                            <SidebarMenuLink
                                tooltip="Settings"
                                href="/settings"
                                data-no-prefetch
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
                            <SidebarMenuLink
                                tooltip="Account"
                                href="/account"
                                data-no-prefetch
                            >
                                <User />
                                <span>Account</span>
                                <KeyboardShortcut
                                    keys={useSetting("openAccount")}
                                    className={`gap-1 transition-opacity transition-duration-200 ${
                                        isSidebarCollapsed
                                            ? "opacity-0"
                                            : "opacity-100"
                                    }`}
                                />
                            </SidebarMenuLink>
                        </SidebarMenuItem>
                    </SidebarFooter>
                </Sidebar>
                <main
                    className="bg-background flex flex-col flex-1 md:border-t md:rounded-tl-xl md:border-l md:overflow-y-auto w-full"
                    style={{ scrollbarGutter: gutter ? "stable" : "auto" }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
