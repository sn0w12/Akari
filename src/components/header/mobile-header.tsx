"use client";

import { useBorderColor } from "@/contexts/border-color-context";
import { useUser } from "@/hooks/use-user";
import {
    BookmarkIcon,
    HomeIcon,
    Menu,
    SearchIcon,
    TrendingUp,
    User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "../ui/sidebar";
import { TabBar, TabBarList, TabBarTrigger } from "../ui/tab-bar";

export function MobileHeader() {
    const { toggleSidebar } = useSidebar();
    const { borderClass } = useBorderColor();
    const { data: user } = useUser();
    const pathname = usePathname();

    return (
        <TabBar className="md:hidden">
            <TabBarList className="mb-[var(--safe-bottom)]">
                <TabBarTrigger
                    aria-label="Open Sidebar"
                    onClick={toggleSidebar}
                    active={
                        pathname === "/settings" ||
                        pathname === "/account" ||
                        pathname.startsWith("/genre/")
                    }
                    className={borderClass}
                >
                    <Menu className="size-6" />
                </TabBarTrigger>
                <TabBarTrigger
                    aria-label="Popular Manga"
                    href="/popular"
                    prefetch={true}
                    active={pathname === "/popular"}
                    className={borderClass}
                >
                    <TrendingUp className="size-6" />
                </TabBarTrigger>
                <TabBarTrigger
                    aria-label="Home"
                    href="/"
                    prefetch={true}
                    active={pathname === "/" || pathname.startsWith("/latest")}
                    className={borderClass}
                >
                    <HomeIcon className="size-6" />
                </TabBarTrigger>
                <TabBarTrigger
                    aria-label="Search"
                    href="/search"
                    prefetch={true}
                    active={pathname === "/search"}
                    className={borderClass}
                >
                    <SearchIcon className="size-6" />
                </TabBarTrigger>
                {user ? (
                    <TabBarTrigger
                        aria-label="Bookmarks"
                        href="/bookmarks"
                        active={pathname === "/bookmarks"}
                        className={borderClass}
                        prefetch={false}
                    >
                        <BookmarkIcon className="size-6" />
                    </TabBarTrigger>
                ) : (
                    <TabBarTrigger
                        aria-label="Login to view bookmarks"
                        href="/auth/login"
                        active={pathname === "/auth/login"}
                        className={borderClass}
                    >
                        <User className="size-6" />
                    </TabBarTrigger>
                )}
            </TabBarList>
        </TabBar>
    );
}
