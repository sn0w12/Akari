import { useBorderColor } from "@/contexts/border-color-context";
import { useUser } from "@/hooks/use-user";
import { useRouterState } from "@tanstack/react-router";
import {
    BookmarkIcon,
    HomeIcon,
    Menu,
    SearchIcon,
    TrendingUp,
    User,
} from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { TabBar, TabBarList, TabBarTrigger } from "../ui/tab-bar";

export function MobileHeader() {
    const { toggleSidebar } = useSidebar();
    const { borderClass } = useBorderColor();
    const { data: user } = useUser();
    const pathname = useRouterState({ select: (s) => s.location.pathname });

    return (
        <TabBar>
            <TabBarList className={borderClass}>
                <TabBarTrigger
                    aria-label="Open Sidebar"
                    onClick={toggleSidebar}
                    active={
                        pathname === "/settings" ||
                        pathname.startsWith("/account") ||
                        pathname.startsWith("/genre/")
                    }
                >
                    <Menu className="size-6" />
                </TabBarTrigger>
                <TabBarTrigger
                    aria-label="Popular Manga"
                    href="/popular"
                    active={pathname === "/popular"}
                >
                    <TrendingUp className="size-6" />
                </TabBarTrigger>
                <TabBarTrigger
                    aria-label="Home"
                    href="/"
                    active={pathname === "/" || pathname === "/latest"}
                >
                    <HomeIcon className="size-6" />
                </TabBarTrigger>
                <TabBarTrigger
                    aria-label="Search"
                    href="/search"
                    active={pathname === "/search"}
                >
                    <SearchIcon className="size-6" />
                </TabBarTrigger>
                {user ? (
                    <TabBarTrigger
                        aria-label="Bookmarks"
                        href="/bookmarks"
                        active={pathname === "/bookmarks"}
                        viewTransition={{
                            types: ({ pathChanged, toLocation }) => {
                                if (!pathChanged) return false;

                                if (
                                    toLocation.pathname === "/" ||
                                    toLocation.pathname === "/popular" ||
                                    toLocation.pathname === "/search"
                                ) {
                                    return ["slide-right"];
                                }

                                return ["slide-left"];
                            },
                        }}
                    >
                        <BookmarkIcon className="size-6" />
                    </TabBarTrigger>
                ) : (
                    <TabBarTrigger
                        aria-label="Login to view bookmarks"
                        href="/auth/login"
                        active={pathname === "/auth/login"}
                        viewTransition={{
                            types: ({ pathChanged, toLocation }) => {
                                if (!pathChanged) return false;

                                if (
                                    toLocation.pathname === "/" ||
                                    toLocation.pathname === "/popular" ||
                                    toLocation.pathname === "/search"
                                ) {
                                    return ["slide-right"];
                                }

                                return ["slide-left"];
                            },
                        }}
                    >
                        <User className="size-6" />
                    </TabBarTrigger>
                )}
            </TabBarList>
        </TabBar>
    );
}
