"use client";

import HoverLink from "./ui/hoverLink";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Icon from "./ui/Header/Icon";
import SearchBar from "./ui/Header/Search/SearchBar";
import SearchButton from "./ui/Header/Search/SearchButton";
import { useEffect, useMemo, useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeSetting } from "./ui/Header/ThemeSettings";
import { SideBar } from "./SideBar";
import { TrackLogin } from "./ui/Header/TrackLogin";
import { validateSecondaryAccounts } from "@/lib/secondaryAccounts";
import BookmarksButton from "./ui/Bookmarks/BookmarksButton";

export function HeaderComponent() {
    const [notification, setNotification] = useState<string>("");

    const fetchNotification = useMemo(
        () => async () => {
            // Check local storage first
            const cached = localStorage.getItem("notification");
            const timestamp = localStorage.getItem("notificationTimestamp");
            const now = Date.now();

            // If we have cached data and it's less than 24 hours old
            if (
                cached &&
                timestamp &&
                now - parseInt(timestamp) < 24 * 60 * 60 * 1000
            ) {
                setNotification(cached);
            }

            try {
                const res = await fetch(`/api/bookmarks/notification`);

                if (!res.ok) {
                    setNotification("");
                    localStorage.removeItem("notification");
                    localStorage.removeItem("notificationTimestamp");
                    return;
                }

                const data = await res.json();
                setNotification(data);
                // Cache the new data
                localStorage.setItem("notification", data);
                localStorage.setItem("notificationTimestamp", now.toString());
            } catch (error) {
                console.error("Error fetching search results:", error);
            }
        },
        [],
    );

    useEffect(() => {
        fetchNotification();
        validateSecondaryAccounts();
    }, [fetchNotification]);

    return (
        <header className="sticky top-0 z-50 bg-background border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <HoverLink
                    href="/"
                    className="text-2xl font-bold title"
                    prefetch={false}
                >
                    <Icon />
                </HoverLink>

                <div className="flex items-center space-x-4 flex-grow justify-end">
                    <SearchBar />
                    <div className="flex gap-4">
                        <SearchButton />
                        {notification ? (
                            <BookmarksButton notification={notification} />
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="w-10 h-10 flex items-center justify-center border rounded-md">
                                            <Bookmark className="h-5 w-5 text-primary/50" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-center text-base">
                                            Please log in to view your bookmarks
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {/* Theme Handler */}
                        <ThemeSetting />
                        {/* Sidebar */}
                        <SideBar />
                        <TrackLogin />
                    </div>
                </div>
            </div>
        </header>
    );
}
