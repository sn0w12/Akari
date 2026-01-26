"use client";

import { BasePagination } from "./base-pagination";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    className?: string;
}

export default function ClientPagination({
    currentPage,
    totalPages,
    handlePageChange,
    className,
}: PaginationProps) {
    return (
        <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            className={className}
            onPageChange={handlePageChange}
        />
    );
}
