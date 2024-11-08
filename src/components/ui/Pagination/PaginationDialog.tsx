// components/ui/PaginationDialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PaginationDialogProps {
    totalPages: number;
    currentPage: number;
}

export function PaginationDialog({
    totalPages,
    currentPage,
}: PaginationDialogProps) {
    const [inputPage, setInputPage] = useState(currentPage);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputPage(Number(e.target.value));
    };

    const handlePageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputPage >= 1 && inputPage <= totalPages) {
            router.push(`?page=${inputPage}`);
            setIsDialogOpen(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <span className="mx-2 cursor-pointer">...</span>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Go to Page</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePageSubmit} className="space-y-4">
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
    );
}