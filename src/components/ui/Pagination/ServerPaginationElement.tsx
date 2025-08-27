import Link from "next/link";
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
    searchParams?: { key: string; value: string }[];
    className?: string;
}

export function PaginationElement({
    currentPage,
    totalPages,
    searchParams = [],
    className,
}: PaginationElementProps) {
    const createPageUrl = (page: number) => {
        return (
            `?page=${page}` +
            searchParams.map((param) => `&${param.key}=${param.value}`).join("")
        );
    };

    return (
        <Pagination
            className={`mb-6 flex items-center justify-center ${className}`}
        >
            <PaginationContent className="flex items-center">
                {currentPage === 1 ? (
                    <PaginationPrevious className="w-12 px-4 md:pl-2 md:w-28 border justify-center pointer-events-none opacity-50" />
                ) : (
                    <PaginationPrevious
                        href={createPageUrl(currentPage - 1)}
                        className="w-12 px-4 md:pl-2 md:w-28 cursor-pointer border justify-center"
                    />
                )}

                {currentPage > 2 && (
                    <>
                        <PaginationItem>
                            <PaginationLink
                                href={createPageUrl(1)}
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
                                    isActive={currentPage === i + 1}
                                    href={createPageUrl(i + 1)}
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
                                href={createPageUrl(totalPages)}
                                className="cursor-pointer"
                            >
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}

                {currentPage === totalPages ? (
                    <PaginationNext className="w-12 px-4 md:pr-2 md:w-28 border justify-center pointer-events-none opacity-50" />
                ) : (
                    <PaginationNext
                        href={createPageUrl(currentPage + 1)}
                        className="w-12 px-4 md:pr-2 md:w-28 cursor-pointer border justify-center"
                    />
                )}
            </PaginationContent>
        </Pagination>
    );
}
