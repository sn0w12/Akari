"use client";

import { useBorderColor } from "@/contexts/border-color-context";
import { cn } from "@/lib/utils";
import {
    BookmarkIcon,
    HomeIcon,
    Menu,
    SearchIcon,
    TrendingUp,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "../ui/sidebar";
import { TabBar, TabBarList, TabBarTrigger } from "../ui/tab-bar";

export function MobileHeader() {
    const { toggleSidebar } = useSidebar();
    const pathname = usePathname();
    const { borderClass } = useBorderColor();

    return (
        <TabBar className={cn("md:hidden")}>
            <TabBarList>
                <TabBarTrigger
                    aria-label="Open Sidebar"
                    onClick={toggleSidebar}
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
                <TabBarTrigger
                    aria-label="Bookmarks"
                    href="/bookmarks"
                    active={pathname === "/bookmarks"}
                    className={borderClass}
                >
                    <BookmarkIcon className="size-6" />
                </TabBarTrigger>
            </TabBarList>
        </TabBar>
    );
}
