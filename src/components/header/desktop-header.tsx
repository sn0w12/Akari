import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { inPreview } from "@/config";
import { useBorderColor } from "@/contexts/border-color-context";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { getSearchResults } from "@/lib/api/search";
import { SearchBar } from "../search/search-bar";
import { useSetting } from "@/lib/settings";

interface HeaderProps {
    notification: string;
}

export function DesktopHeader({ notification }: HeaderProps) {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { data: user } = useUser();
    const { overrides } = useBreadcrumb();
    const { borderClass } = useBorderColor();
    const [segments, setSegments] = useState<string[]>([]);
    const [originalSegments, setOriginalSegments] = useState<string[]>([]);
    const { state: sidebarState } = useSidebar();
    const isSidebarCollapsed = sidebarState === "collapsed";

    const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            str,
        );

    useEffect(() => {
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length === 0) {
            pathSegments.push("manga");
        }

        const hasUnresolvedUUID = pathSegments.some(
            (segment) => isUUID(segment) && !overrides[segment],
        );
        if (hasUnresolvedUUID) {
            return;
        }

        const modifiedSegments = pathSegments.map(
            (segment) => overrides[segment] || segment,
        );
        queueMicrotask(() => {
            setOriginalSegments(pathSegments);
            setSegments(modifiedSegments);
        });
    }, [pathname, overrides]);

    const getSegmentDisplayName = (segment: string, maxLength: number = 35) => {
        segment = segment.replace(/-s-/g, "'s ");
        segment = segment.replace(/-/g, " ");

        const capitalizedSegment =
            segment.charAt(0).toUpperCase() + segment.slice(1);

        return capitalizedSegment.length > maxLength
            ? `${capitalizedSegment.substring(0, maxLength)}...`
            : capitalizedSegment;
    };

    return (
        <header
            className={cn(
                `z-50 bg-sidebar border-b-0 h-10 hidden md:block`,
                borderClass,
            )}
        >
            <div className="py-1 pr-4 md:pr-6.5 pl-11 mx-auto flex items-center justify-between">
                <SidebarTrigger className="absolute left-4 md:left-2" />
                {notification && notification !== "0" ? (
                    <Badge
                        variant="success"
                        className={cn("text-xs font-bold px-2 h-5", {
                            "ml-1": isSidebarCollapsed,
                        })}
                    >
                        {notification}
                    </Badge>
                ) : null}
                {user?.banned ? (
                    <Badge
                        variant="destructive"
                        className="text-xs font-bold px-2 h-5 ml-2"
                    >
                        Banned
                    </Badge>
                ) : null}
                {inPreview ? (
                    <Badge
                        variant="warning"
                        className="text-xs font-bold px-2 h-5 ml-2"
                    >
                        Preview
                    </Badge>
                ) : null}
                <div
                    className={`flex h-full items-center pr-2 transition-all pl-4 md:pl-2`}
                >
                    <Breadcrumb>
                        <BreadcrumbList>
                            {segments.map((segment, index) => (
                                <React.Fragment
                                    key={originalSegments
                                        .slice(0, index + 1)
                                        .join("/")}
                                >
                                    {index != 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {index != 0 ? (
                                            <BreadcrumbLink
                                                to={`/${originalSegments.slice(0, index + 1).join("/")}`}
                                            >
                                                {getSegmentDisplayName(segment)}
                                            </BreadcrumbLink>
                                        ) : (
                                            <span>
                                                {getSegmentDisplayName(segment)}
                                            </span>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center flex-grow justify-end">
                    <SearchBar
                        getSearchResults={getSearchResults}
                        shortcut={useSetting("searchManga")}
                        className="relative transition-[width] w-auto flex-grow lg:grow-0 lg:w-96 xl:w-128"
                        focusClassName="xl:w-[40rem] lg:w-128"
                        moreUrl="/search"
                    />
                </div>
            </div>
        </header>
    );
}
