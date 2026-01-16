"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "../button-link";
import { JumpToPagePopover } from "./pagination-popover";
import { getVisiblePages } from "./util";

interface PaginationElementProps {
    currentPage: number;
    totalPages: number;
    className?: string;
    href?: string;
}

export function ServerPagination({
    currentPage,
    totalPages,
    className,
    href,
}: PaginationElementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [jumpToPage, setJumpToPage] = useState(currentPage.toString());
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const visiblePages = getVisiblePages(currentPage, totalPages);

    const createPageUrl = (page: number) => {
        const base = href || "";
        const separator = base.includes("?") ? "&" : "?";

        // Get all current search params except 'page'
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== "page" && value) {
                params.append(key, value);
            }
        });

        // Add the new page param
        params.set("page", page.toString());

        const paramsString = params.toString();
        return base + separator + paramsString;
    };

    const handlePageChange = (page: number) => {
        router.push(createPageUrl(page));
    };

    return (
        <nav
            className={cn(
                "flex items-center justify-between w-full max-w-md mx-auto",
                className,
            )}
            aria-label="Pagination"
        >
            {/* Previous Button - Fixed left position */}
            <ButtonLink
                variant="outline"
                size="sm"
                href={createPageUrl(currentPage - 1)}
                onMouseOver={() => {
                    router.prefetch(
                        `${createPageUrl(currentPage - 1)}&_prefetch=1`,
                    );
                }}
                disabled={currentPage <= 1}
                className="min-w-9 h-9 flex-shrink-0"
                aria-label="Go to previous page"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
            </ButtonLink>

            {/* Page Numbers - Fixed center container */}
            <div className="flex items-center justify-center gap-1 flex-1">
                {visiblePages.map((page, index) => {
                    const isCurrentPage = page === currentPage;

                    if (isCurrentPage) {
                        return (
                            <JumpToPagePopover
                                key={page}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                handlePageChange={handlePageChange}
                                jumpToPage={jumpToPage}
                                setJumpToPage={setJumpToPage}
                                isPopoverOpen={isPopoverOpen}
                                setIsPopoverOpen={setIsPopoverOpen}
                            />
                        );
                    }

                    return (
                        <ButtonLink
                            key={page}
                            variant="outline"
                            size="sm"
                            href={createPageUrl(page)}
                            className={cn("min-w-9 h-9", {
                                "inline-flex":
                                    index === 1 ||
                                    index === visiblePages.length - 2,
                            })}
                            aria-label={`Go to page ${page}`}
                        >
                            {page}
                        </ButtonLink>
                    );
                })}
            </div>

            {/* Next Button - Fixed right position */}
            <ButtonLink
                variant="outline"
                size="sm"
                href={createPageUrl(currentPage + 1)}
                onMouseOver={() => {
                    router.prefetch(
                        `${createPageUrl(currentPage + 1)}&_prefetch=1`,
                    );
                }}
                disabled={currentPage >= totalPages}
                className="min-w-9 h-9 flex-shrink-0"
                aria-label="Go to next page"
            >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
            </ButtonLink>
        </nav>
    );
}
