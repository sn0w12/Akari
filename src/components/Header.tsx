"use client";

import SearchBar from "./ui/Header/Search/SearchBar";
import SearchButton from "./ui/Header/Search/SearchButton";
import { useEffect, useState } from "react";
import { ThemeSetting } from "./ui/Header/ThemeSettings";
import { validateSecondaryAccounts } from "@/lib/secondaryAccounts";
import BookmarksButton from "./ui/Bookmarks/BookmarksButton";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import { fetchNotification } from "@/lib/bookmarks";

export function HeaderComponent() {
    const pathname = usePathname();
    const [notification, setNotification] = useState<string>("");
    const [segments, setSegments] = useState<string[]>([]);
    const { state: sidebarState } = useSidebar();
    const isSidebarCollapsed = sidebarState === "collapsed";

    useEffect(() => {
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length === 0) {
            pathSegments.push("manga");
        }

        setSegments(pathSegments);
    }, [pathname]);

    useEffect(() => {
        fetchNotification().then(setNotification);
        validateSecondaryAccounts();
    }, []);

    const getSegmentDisplayName = (
        segment: string,
        index: number,
        segments: string[],
        maxLength: number = 35,
    ) => {
        segment = segment.replace(/-s-/g, "'s ");
        segment = segment.replace(/-/g, " ");

        const capitalizedSegment =
            segment.charAt(0).toUpperCase() + segment.slice(1);

        return capitalizedSegment.length > maxLength
            ? `${capitalizedSegment.substring(0, maxLength)}...`
            : capitalizedSegment;
    };

    return (
        <header className="fixed top-0 left-0 right-0 md:sticky z-50 bg-sidebar border-b md:border-b-0 md:z-60">
            <div className="py-1 pr-4 md:pr-11 pl-11 mx-auto flex items-center justify-between">
                <SidebarTrigger className="absolute left-4 md:left-2" />
                {notification && notification !== "0" ? (
                    <span
                        className={`hidden md:block bg-accent-color text-white text-xs font-bold rounded-full px-2 h-5 flex content-center transition-all ${isSidebarCollapsed ? "ml-1" : ""}`}
                    >
                        {notification}
                    </span>
                ) : null}
                {process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1" ? (
                    <span
                        className={`hidden md:block bg-amber-700 text-white text-xs font-bold rounded-full px-2 h-5 flex content-center transition-all ${isSidebarCollapsed ? "ml-1" : ""}`}
                    >
                        Preview
                    </span>
                ) : null}
                <div
                    className={`hidden md:block flex h-full items-center pr-2 transition-all pl-4 ${isSidebarCollapsed && notification ? "md:pl-3" : "md:pl-2"}`}
                >
                    <Breadcrumb>
                        <BreadcrumbList>
                            {segments.map((segment, index) => (
                                <React.Fragment key={index}>
                                    {index != 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {index != 0 ? (
                                            <BreadcrumbLink
                                                href={`/${segments
                                                    .slice(0, index + 1)
                                                    .join("/")}`}
                                                title={getSegmentDisplayName(
                                                    segment,
                                                    index,
                                                    segments,
                                                    9999,
                                                )}
                                                tabIndex={-1}
                                            >
                                                {getSegmentDisplayName(
                                                    segment,
                                                    index,
                                                    segments,
                                                )}
                                            </BreadcrumbLink>
                                        ) : (
                                            <span>
                                                {getSegmentDisplayName(
                                                    segment,
                                                    index,
                                                    segments,
                                                )}
                                            </span>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center flex-grow justify-end">
                    <SearchBar />
                    <div className="flex gap-2">
                        <SearchButton />
                        <BookmarksButton notification={notification} />

                        {/* Theme Handler */}
                        <ThemeSetting />
                    </div>
                </div>
            </div>
        </header>
    );
}
