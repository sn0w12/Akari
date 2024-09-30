import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

const PaginationElement: React.FC<PaginationElementProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  const [inputPage, setInputPage] = useState(currentPage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(Number(e.target.value));
  };

  const handlePageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputPage >= 1 && inputPage <= totalPages) {
      handlePageChange(inputPage);
      setIsDialogOpen(false); // Close the dialog after page change
    }
  };

  return (
    <Pagination className="mb-6 flex items-center justify-center space-x-2">
      <PaginationContent className="flex items-center">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            className={`cursor-pointer ${currentPage === 1 ? "disabled" : ""}`}
          />
        </PaginationItem>

        {/* Render ellipsis and first page link if needed */}
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

            {/* Dialog for page input */}
            <PaginationItem>
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
                      className="w-full bg-blue-500 text-white py-2 rounded-md"
                    >
                      Go to Page
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            </PaginationItem>
          </>
        )}

        {/* Render surrounding page numbers */}
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

        {/* Render ellipsis and last page link if needed */}
        {currentPage < totalPages - 1 && (
          <>
            {/* Dialog for page input */}
            <PaginationItem>
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
                      className="w-full bg-blue-500 text-white py-2 rounded-md"
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

        <PaginationItem>
          <PaginationNext
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            className={`cursor-pointer ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationElement;
