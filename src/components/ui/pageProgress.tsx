import React from "react";

interface PageProgressProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function PageProgress({
  currentPage,
  totalPages,
  setCurrentPage,
}: PageProgressProps) {
  const handleClick = (page: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPage(page);
  };

  return (
    <div
      className="fixed hidden right-4 top-1/2 transform -translate-y-1/2 z-50 lg:flex"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative p-1 rounded-lg border border-primary/30 bg-background"
        style={{
          width: "30px",
          height: "80vh",
        }}
      >
        <div
          className="absolute left-1 top-1 right-1 bg-primary/20 transition-all duration-300 ease-in-out rounded-lg"
          style={{
            height: `${((currentPage + 1 - 0.5) / totalPages) * 100}%`,
          }}
        />
        <div className="relative flex flex-col h-full gap-1">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={(e) => handleClick(index, e)}
              className={`flex-1 w-full transition-all duration-300 ease-in-out ${
                index + 1 <= currentPage + 1
                  ? "bg-primary"
                  : "bg-primary/30 hover:bg-primary/50"
              }`}
              style={{
                marginTop: index === 0 ? "0" : "2px",
                borderRadius: "4px",
              }}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
