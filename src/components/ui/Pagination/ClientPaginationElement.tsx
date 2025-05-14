"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { PaginationDialog } from "./PaginationDialog";
import { Button } from "../button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
                <Button
                    variant={"ghost"}
                    onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={`gap-1 pr-2.5 w-12 px-4 md:pr-2 md:w-28 cursor-pointer border justify-center ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden md:block">Previous</span>
                </Button>

                {currentPage > 2 && (
                    <>
                        <PaginationItem>
                            <Button
                                variant={"ghost"}
                                onClick={() => handlePageChange(1)}
                                className="cursor-pointer"
                            >
                                1
                            </Button>
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
                                <Button
                                    variant={"ghost"}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`cursor-pointer ${currentPage === i + 1 ? "border" : ""}`}
                                >
                                    {i + 1}
                                </Button>
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
                            <Button
                                variant={"ghost"}
                                onClick={() => handlePageChange(totalPages)}
                                className="cursor-pointer"
                            >
                                {totalPages}
                            </Button>
                        </PaginationItem>
                    </>
                )}

                <Button
                    variant={"ghost"}
                    onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                    }
                    className={`gap-1 pr-2.5 w-12 px-4 md:pr-2 md:w-28 cursor-pointer border justify-center ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                    <span className="hidden md:block">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </PaginationContent>
        </Pagination>
    );
}
