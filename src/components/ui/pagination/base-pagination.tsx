"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { JumpToPagePopover } from "./pagination-popover";
import { getVisiblePages } from "./util";

interface BasePaginationProps {
    currentPage: number;
    totalPages: number;
    className?: string;
    // Client pagination props
    onPageChange?: (page: number) => void;
    // Server pagination props
    getPageUrl?: (page: number) => string;
    onPrefetch?: (url: string) => void;
}

export function BasePagination({
    currentPage,
    totalPages,
    className,
    onPageChange,
    getPageUrl,
    onPrefetch,
}: BasePaginationProps) {
    const [jumpToPage, setJumpToPage] = useState(currentPage.toString());
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const visiblePages = getVisiblePages(currentPage, totalPages);

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else if (getPageUrl) {
            // For server pagination, navigation is handled by the link
            // This is used by the JumpToPagePopover
            window.location.href = getPageUrl(page);
        }
    };

    const isServerPagination = !!getPageUrl;

    const renderButton = (
        page: number,
        content: React.ReactNode,
        disabled: boolean,
        ariaLabel: string,
        className: string,
    ) => {
        if (isServerPagination && getPageUrl) {
            const url = getPageUrl(page);
            return (
                <ButtonLink
                    variant="outline"
                    size="sm"
                    href={url}
                    onMouseOver={() => onPrefetch?.(url)}
                    disabled={disabled}
                    className={className}
                    aria-label={ariaLabel}
                >
                    {content}
                </ButtonLink>
            );
        }

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page)}
                disabled={disabled}
                className={className}
                aria-label={ariaLabel}
            >
                {content}
            </Button>
        );
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
            {renderButton(
                currentPage - 1,
                <>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                </>,
                currentPage <= 1,
                "Go to previous page",
                "min-w-9 h-9 flex-shrink-0",
            )}

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
                        <span key={page}>
                            {renderButton(
                                page,
                                page,
                                false,
                                `Go to page ${page}`,
                                cn("min-w-9 h-9", {
                                    "inline-flex":
                                        index === 1 ||
                                        index === visiblePages.length - 2,
                                }),
                            )}
                        </span>
                    );
                })}
            </div>

            {/* Next Button - Fixed right position */}
            {renderButton(
                currentPage + 1,
                <>
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </>,
                currentPage >= totalPages,
                "Go to next page",
                "min-w-9 h-9 flex-shrink-0",
            )}
        </nav>
    );
}
