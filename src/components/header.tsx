"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "./header/search/search-bar";
import SearchButton from "./header/search/search-button";
import { validateSecondaryAccounts } from "@/lib/auth/secondary-accounts";
import BookmarksButton from "./header/bookmarks-button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ButtonLink } from "./ui/button-link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSettingsChange } from "@/lib/settings";
import { inPreview } from "@/config";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useUser } from "@/contexts/user-context";
import { HomeIcon } from "lucide-react";

interface HeaderProps {
    notification: string;
}

export function HeaderComponent({ notification }: HeaderProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const { overrides } = useBreadcrumb();
    const [segments, setSegments] = useState<string[]>([]);
    const [originalSegments, setOriginalSegments] = useState<string[]>([]);
    const { state: sidebarState } = useSidebar();
    const isSidebarCollapsed = useMemo(
        () => sidebarState === "collapsed",
        [sidebarState]
    );
    const { setTheme } = useTheme();

    useSettingsChange((event) => {
        setTheme(String(event.detail.value));
    }, "theme");

    const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            str
        );

    useEffect(() => {
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length === 0) {
            pathSegments.push("manga");
        }

        const hasUnresolvedUUID = pathSegments.some(
            (segment) => isUUID(segment) && !overrides[segment]
        );
        if (hasUnresolvedUUID) {
            return;
        }

        const modifiedSegments = pathSegments.map(
            (segment) => overrides[segment] || segment
        );
        queueMicrotask(() => {
            setOriginalSegments(pathSegments);
            setSegments(modifiedSegments);
        });
    }, [pathname, overrides]);

    useEffect(() => {
        if (!user) return;

        validateSecondaryAccounts();
    }, [user]);

    const getSegmentDisplayName = (
        segment: string,
        index: number,
        segments: string[],
        maxLength: number = 35
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
        <header className="top-0 left-0 z-50 bg-sidebar border-b sticky md:border-b-0 h-12 md:h-10">
            <div className="py-1 pr-4 md:pr-7 pl-11 mx-auto flex items-center justify-between">
                <SidebarTrigger className="absolute left-4 md:left-2" />
                {notification && notification !== "0" ? (
                    <span
                        className={`hidden md:block bg-accent-positive text-white text-xs font-bold rounded-full px-2 h-5 flex content-center transition-all ${
                            isSidebarCollapsed ? "ml-1" : ""
                        }`}
                    >
                        {notification}
                    </span>
                ) : null}
                {inPreview ? (
                    <span
                        className={`hidden md:block bg-amber-700 text-white text-xs font-bold rounded-full px-2 h-5 flex content-center transition-all ${
                            isSidebarCollapsed ? "ml-1" : ""
                        }`}
                    >
                        Preview
                    </span>
                ) : null}
                <div
                    className={`hidden md:block flex h-full items-center pr-2 transition-all pl-4 md:pl-2`}
                >
                    <Breadcrumb>
                        <BreadcrumbList>
                            {segments.map((segment, index) => (
                                <React.Fragment key={index}>
                                    {index != 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {index != 0 ? (
                                            <BreadcrumbLink
                                                href={`/${originalSegments
                                                    .slice(0, index + 1)
                                                    .join("/")}`}
                                                title={getSegmentDisplayName(
                                                    segment,
                                                    index,
                                                    segments,
                                                    9999
                                                )}
                                                tabIndex={-1}
                                                data-no-prefetch
                                            >
                                                {getSegmentDisplayName(
                                                    segment,
                                                    index,
                                                    segments
                                                )}
                                            </BreadcrumbLink>
                                        ) : (
                                            <span>
                                                {getSegmentDisplayName(
                                                    segment,
                                                    index,
                                                    segments
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
                        <ButtonLink
                            href="/"
                            variant="ghost"
                            size="icon"
                            className="md:hidden border touch-manipulation size-10"
                        >
                            <HomeIcon className="size-5" />
                        </ButtonLink>
                        <BookmarksButton notification={notification} />
                    </div>
                </div>
            </div>
        </header>
    );
}
