"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/input";
import {
    PopoverDrawer,
    PopoverDrawerContent,
    PopoverDrawerTrigger,
} from "../popover-drawer";

interface JumpToPagePopoverProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    jumpToPage: string;
    setJumpToPage: (value: string) => void;
    isPopoverOpen: boolean;
    setIsPopoverOpen: (open: boolean) => void;
}

export function JumpToPagePopover({
    currentPage,
    totalPages,
    handlePageChange,
    jumpToPage,
    setJumpToPage,
    isPopoverOpen,
    setIsPopoverOpen,
}: JumpToPagePopoverProps) {
    const handleJumpToPage = () => {
        const page = Number.parseInt(jumpToPage);
        if (page >= 1 && page <= totalPages) {
            handlePageChange(page);
            setIsPopoverOpen(false);
            setJumpToPage(page.toString());
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleJumpToPage();
        }
    };

    return (
        <PopoverDrawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverDrawerTrigger>
                <Button
                    variant="default"
                    size="sm"
                    className="min-w-9 h-9"
                    aria-label={`Current page ${currentPage}, click to jump to page`}
                    aria-current="page"
                >
                    {currentPage}
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent
                popoverClassName="w-42 p-2"
                popoverAlign="center"
                popoverSide="top"
            >
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                        Jump to page
                    </p>
                    <div className="flex">
                        <NumberInput
                            type="number"
                            min="1"
                            max={totalPages}
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Page"
                            className="h-7 md:text-xs rounded-r-none"
                            wrapperClassName="flex-1"
                            autoFocus
                        />
                        <Button
                            size="sm"
                            onClick={handleJumpToPage}
                            disabled={
                                !jumpToPage ||
                                Number.parseInt(jumpToPage) < 1 ||
                                Number.parseInt(jumpToPage) > totalPages
                            }
                            className="h-7 px-2 text-xs rounded-l-none"
                        >
                            Go
                        </Button>
                    </div>
                </div>
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
}
