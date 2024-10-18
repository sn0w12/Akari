import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";

interface PaginationElementProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
}

export default function PaginationElement({
    currentPage,
    totalPages,
    handlePageChange,
}: PaginationElementProps) {
    const [inputPage, setInputPage] = useState(currentPage);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputPage(Number(e.target.value));
    };

    const handlePageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputPage >= 1 && inputPage <= totalPages) {
            handlePageChange(inputPage);
            setIsDialogOpen(false);
        }
    };

    return (
        <Pagination className="mb-6 flex items-center justify-center">
            <PaginationContent className="flex items-center">
                <PaginationPrevious
                    onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={`w-24 cursor-pointer border justify-center ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
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
                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <span className="mx-2 cursor-pointer">
                                        ...
                                    </span>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Go to Page</DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handlePageSubmit}
                                        className="space-y-4"
                                    >
                                        <Input
                                            type="number"
                                            value={inputPage}
                                            onChange={handleInputChange}
                                            className="w-full"
                                            min={1}
                                            max={totalPages}
                                            placeholder={`Enter a page (1-${totalPages})`}
                                        />
                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-primary py-2 text-primary-foreground"
                                        >
                                            Go to Page
                                        </button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </PaginationItem>
                    </>
                )}

                {[...Array(totalPages)].map((_, i) => {
                    if (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1) {
                        return (
                            <PaginationItem key={i}>
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
                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <span className="mx-2 cursor-pointer">
                                        ...
                                    </span>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Go to Page</DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handlePageSubmit}
                                        className="space-y-4"
                                    >
                                        <Input
                                            type="number"
                                            value={inputPage}
                                            onChange={handleInputChange}
                                            className="w-full"
                                            min={1}
                                            max={totalPages}
                                            placeholder={`Enter a page (1-${totalPages})`}
                                        />
                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-primary py-2 text-primary-foreground"
                                        >
                                            Go to Page
                                        </button>
                                    </form>
                                </DialogContent>
                            </Dialog>
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
                    className={`w-24 cursor-pointer border justify-center ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                />
            </PaginationContent>
        </Pagination>
    );
}
