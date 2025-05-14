"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationDialog } from "./PaginationDialog";

interface PaginationElementProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    className?: string;
}

export default function PaginationElement({
    currentPage,
    totalPages,
    handlePageChange,
    className,
}: PaginationElementProps) {
    return (
        <Pagination
            className={`mb-6 flex items-center justify-center ${className}`}
        >
            <PaginationContent className="flex items-center">
                <PaginationPrevious
                    onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={`w-12 px-4 md:pl-2 md:w-28 cursor-pointer border justify-center ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                />

                {currentPage > 2 && (
                    <>
                        <PaginationItem>
                            <PaginationLink
                                onClick={() => handlePageChange(1)}
                                className="cursor-pointer"
                            >
                                1
                            </PaginationLink>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationDialog
                                totalPages={totalPages}
                                currentPage={currentPage}
                            />
                        </PaginationItem>
                    </>
                )}

                {[...Array(totalPages)].map((_, i) => {
                    if (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1) {
                        return (
                            <PaginationItem
                                key={i}
                                className={`${i + 1 === currentPage ? "" : "hidden md:flex"}`}
                            >
                                <PaginationLink
                                    onClick={() => handlePageChange(i + 1)}
                                    isActive={currentPage === i + 1}
                                    className="cursor-pointer"
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    }
                    return null;
                })}

                {currentPage < totalPages - 1 && (
                    <>
                        <PaginationItem>
                            <PaginationDialog
                                totalPages={totalPages}
                                currentPage={currentPage}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink
                                onClick={() => handlePageChange(totalPages)}
                                className="cursor-pointer"
                            >
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}

                <PaginationNext
                    onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                    }
                    className={`w-12 px-4 md:pr-2 md:w-28 cursor-pointer border justify-center ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                />
            </PaginationContent>
        </Pagination>
    );
}
