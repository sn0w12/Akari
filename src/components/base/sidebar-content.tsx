import {
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuLink,
    SidebarSection,
    useSidebar,
} from "@/components/ui/sidebar";
import { GENRE_CATEGORIES } from "@/lib/api/search";
import { useSetting } from "@/lib/settings";
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
import { AccountButton } from "../account/account-button";
import { KeyboardShortcut } from "../ui/keyboard-shortcut";
import { Separator } from "../ui/separator";

const categoryIcons: Record<string, React.ReactNode> = {
    Demographics: <Users />,
    Format: <BookType />,
    Genres: <Theater />,
    Themes: <Mountain />,
    Mature: <BadgeAlert />,
};

export function BaseSidebarContent({ notification }: { notification: string }) {
    const { state: sidebarState } = useSidebar();
    const isSidebarCollapsed = sidebarState === "collapsed";

    return (
        <>
            <SidebarContent
                data-scrollbar-custom="true"
                className="mt-[var(--safe-top)] md:mt-0"
            >
                <SidebarMenu className="p-2 pt-3 gap-0.5">
                    <Separator className="hidden md:block" />

                    <SidebarMenuItem className="hidden md:block">
                        <SidebarMenuLink tooltip="Home" to="/">
                            <HomeIcon />
                            <span>Home</span>
                        </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="hidden md:block">
                        <SidebarMenuLink
                            tooltip={`Bookmarks${notification ? " •" : ""} ${notification}`}
                            to="/bookmarks"
                            aria-label={`${notification} Unread Bookmarks`}
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
                        <SidebarMenuLink tooltip="Popular" to="/popular">
                            <TrendingUp />
                            <span>Popular</span>
                        </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="hidden md:block">
                        <SidebarMenuLink tooltip="Search" to="/search">
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
                                icon={categoryIcons[category] || <FolderIcon />}
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
                    <SidebarMenuLink tooltip="Settings" to="/settings">
                        <SettingsIcon />
                        <span>Settings</span>
                        <KeyboardShortcut
                            keys={useSetting("openSettings")}
                            className={`transition-opacity ease-snappy ${
                                isSidebarCollapsed ? "opacity-0" : "opacity-100"
                            }`}
                        />
                    </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <AccountButton isSidebarCollapsed={isSidebarCollapsed} />
                </SidebarMenuItem>
            </SidebarFooter>
        </>
    );
}
