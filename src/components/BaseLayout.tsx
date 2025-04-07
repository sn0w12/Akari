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
import { HeaderComponent } from "./Header";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuLink,
    SidebarMenuItem,
    SidebarSection,
    SidebarFooter,
    useSidebar,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { GENRE_CATEGORIES } from "@/lib/search";
import { BookmarksContextMenu } from "./ui/Bookmarks/BookmarksContextMenu";
import { fetchNotification } from "@/lib/bookmarks";
import { useEffect, useState } from "react";
import SettingsDialog from "@/components/ui/Header/SettingsDialog";
import { getSettings, useSetting } from "@/lib/settings";
import { useSettingsDialog } from "@/hooks/useSettingsDialog";
import { useRouter } from "next/navigation";
import { useShortcut } from "@/hooks/useShortcut";

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

    const { openSettings } = useSettingsDialog();
    const preferSettingsPage = useSetting("preferSettingsPage");

    type ShortcutSettings = {
        toggleSidebar: string | null;
        openSettings: string | null;
        openAccount: string | null;
        navigateBookmarks: string | null;
    };
    const [shortcuts, setShortcuts] = useState<ShortcutSettings>({
        toggleSidebar: null,
        openSettings: null,
        openAccount: null,
        navigateBookmarks: null,
    });

    const handleSettingsClick = () => {
        if (preferSettingsPage) {
            router.push("/settings");
            return;
        }

        setTimeout(() => {
            openSettings();
        }, 100);
    };

    useEffect(() => {
        const settings = getSettings([
            "toggleSidebar",
            "openSettings",
            "openAccount",
            "navigateBookmarks",
        ]);
        setShortcuts(
            (settings as ShortcutSettings) ?? {
                toggleSidebar: null,
                openSettings: null,
                openAccount: null,
                navigateBookmarks: null,
            },
        );
    }, []);
    useShortcut(shortcuts.openSettings || "", handleSettingsClick, {
        preventDefault: true,
    });
    useShortcut(shortcuts.openAccount || "", () => router.push("/account"), {
        preventDefault: true,
    });
    useShortcut(
        shortcuts.navigateBookmarks || "",
        () => {
            router.push("/bookmarks");
        },
        { preventDefault: true },
    );

    useEffect(() => {
        fetchNotification().then(setNotification);
    }, [setNotification]);

    return (
        <div className="flex flex-col w-full md:overflow-hidden">
            <HeaderComponent />
            <div className="bg-sidebar flex flex-1 mt-12 md:mt-0 md:overflow-y-auto">
                <Sidebar collapsible="icon">
                    <SidebarContent data-scrollbar-custom="true">
                        <SidebarMenu className="p-2 pt-3">
                            <Separator className="hidden md:block" />

                            <SidebarMenuItem>
                                <SidebarMenuLink tooltip="Home" href="/">
                                    <HomeIcon />
                                    <span>Home</span>
                                </SidebarMenuLink>
                            </SidebarMenuItem>
                            <BookmarksContextMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuLink
                                        tooltip={`Bookmarks • ${notification}`}
                                        href="/bookmarks"
                                    >
                                        <Bookmark />
                                        <span>Bookmarks</span>
                                    </SidebarMenuLink>
                                </SidebarMenuItem>
                            </BookmarksContextMenu>
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
                    <SidebarFooter>
                        <Separator />
                        <SidebarMenuItem>
                            {preferSettingsPage ? (
                                <SidebarMenuLink
                                    tooltip="Settings"
                                    href="/settings"
                                >
                                    <SettingsIcon />
                                    <span>Settings</span>
                                </SidebarMenuLink>
                            ) : (
                                <SidebarMenuButton
                                    onClick={handleSettingsClick}
                                >
                                    <SettingsIcon />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuLink tooltip="Account" href="/account">
                                <User />
                                <span>Account</span>
                            </SidebarMenuLink>
                        </SidebarMenuItem>
                    </SidebarFooter>
                </Sidebar>
                <main
                    className="bg-background flex-1 flex flex-col md:border-t md:rounded-tl-xl md:border-l md:overflow-y-auto"
                    style={{ scrollbarGutter: gutter ? "stable" : "auto" }}
                >
                    {children}
                </main>
                <SettingsDialog />
            </div>
        </div>
    );
}
