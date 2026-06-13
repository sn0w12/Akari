import {
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuLink,
    SidebarSection,
    useSidebar,
} from "@/components/ui/sidebar";
import { Genre, GENRE_CATEGORIES } from "@/lib/api/search";
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
import { useRouterState } from "@tanstack/react-router";

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
    const pathname = useRouterState({ select: (s) => s.location.pathname });

    function isCategoryActive(genres: readonly Genre[]): boolean {
        const paths = pathname.split("/").filter(Boolean);
        return genres.includes(paths[paths.length - 1] as Genre);
    }

    function isGenreActive(genre: string): boolean {
        const paths = pathname.split("/").filter(Boolean);
        return paths[0] === "genre" && paths[paths.length - 1] === genre;
    }

    return (
        <>
            <SidebarContent
                data-scrollbar-custom="true"
                className="mt-[var(--safe-top)] md:mt-0"
            >
                <SidebarMenu className="p-2 pt-3 gap-0.5">
                    <Separator className="hidden md:block" />

                    <SidebarMenuItem className="hidden md:block">
                        <SidebarMenuLink
                            tooltip="Home"
                            to="/"
                            active={pathname === "/" || pathname === "/latest"}
                        >
                            <HomeIcon />
                            <span>Home</span>
                        </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="hidden md:block">
                        <SidebarMenuLink
                            tooltip={`Bookmarks${notification ? " •" : ""} ${notification}`}
                            to="/bookmarks"
                            aria-label={`${notification} Unread Bookmarks`}
                            active={pathname === "/bookmarks"}
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
                            to="/popular"
                            active={pathname === "/popular"}
                        >
                            <TrendingUp />
                            <span>Popular</span>
                        </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="hidden md:block">
                        <SidebarMenuLink
                            tooltip="Search"
                            to="/search"
                            active={pathname === "/search"}
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
                                icon={categoryIcons[category] || <FolderIcon />}
                                items={genres.map((genre) => ({
                                    name: genre,
                                    id: genre,
                                }))}
                                active={isCategoryActive(genres)}
                                isItemActive={isGenreActive}
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
                        to="/settings"
                        active={pathname === "/settings"}
                    >
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
