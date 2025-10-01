"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JumpToPagePopover } from "./pagination-popover";
import { useRouter } from "next/navigation";
import { getVisiblePages } from "./util";

interface PaginationElementProps {
    currentPage: number;
    totalPages: number;
    searchParams?: { key: string; value: string }[];
    className?: string;
}

export function ServerPagination({
    currentPage,
    totalPages,
    searchParams = [],
    className,
}: PaginationElementProps) {
    const router = useRouter();
    const [jumpToPage, setJumpToPage] = useState(currentPage.toString());
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const visiblePages = getVisiblePages(currentPage, totalPages);

    const createPageUrl = (page: number) => {
        return (
            `?page=${page}` +
            searchParams.map((param) => `&${param.key}=${param.value}`).join("")
        );
    };

    const handlePageChange = (page: number) => {
        router.push(createPageUrl(page));
    };

    return (
        <nav
            className={cn(
                "flex items-center justify-between w-full max-w-md mx-auto",
                className
            )}
            aria-label="Pagination"
        >
            {/* Previous Button - Fixed left position */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                onMouseOver={() => {
                    router.prefetch(
                        `${createPageUrl(currentPage - 1)}&_prefetch=1`
                    );
                }}
                disabled={currentPage <= 1}
                className="min-w-[2.5rem] h-9 flex-shrink-0"
                aria-label="Go to previous page"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
            </Button>

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
                        <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={cn("min-w-[2.5rem] h-9", {
                                "hidden sm:inline-flex":
                                    index === 1 ||
                                    index === visiblePages.length - 2,
                            })}
                            aria-label={`Go to page ${page}`}
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            {/* Next Button - Fixed right position */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                onMouseOver={() => {
                    router.prefetch(
                        `${createPageUrl(currentPage + 1)}&_prefetch=1`
                    );
                }}
                disabled={currentPage >= totalPages}
                className="min-w-[2.5rem] h-9 flex-shrink-0"
                aria-label="Go to next page"
            >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}
