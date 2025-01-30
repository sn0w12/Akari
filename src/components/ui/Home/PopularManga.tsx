"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SmallManga } from "@/app/api/interfaces";
import { MangaCard } from "./MangaCard";

interface PopularMangaProps {
    mangas: SmallManga[];
}

export function PopularManga({ mangas }: PopularMangaProps) {
    const [currentPopularPage, setCurrentPopularPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 640 ? 6 : 12);
        };

        handleResize(); // Set initial value
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalPopularPages = Math.ceil(mangas.length / itemsPerPage);

    // Reset to page 1 when itemsPerPage changes
    useEffect(() => {
        setCurrentPopularPage(1);
    }, [itemsPerPage]);

    const paginatedPopularList = mangas.slice(
        (currentPopularPage - 1) * itemsPerPage,
        currentPopularPage * itemsPerPage,
    );

    const handlePopularPreviousPage = () => {
        if (currentPopularPage > 1) {
            setCurrentPopularPage(currentPopularPage - 1);
        }
    };

    const handlePopularNextPage = () => {
        if (currentPopularPage < totalPopularPages) {
            setCurrentPopularPage(currentPopularPage + 1);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {paginatedPopularList.map((manga, index) => (
                    <MangaCard
                        key={index}
                        manga={manga}
                        loading="eager"
                        priority={index <= 4}
                    />
                ))}
            </div>

            {/* Pagination Controls for Popular Releases */}
            <div className="flex justify-between items-center mt-6 px-4 py-4 border-t border-b">
                <Button
                    variant="outline"
                    onClick={handlePopularPreviousPage}
                    disabled={currentPopularPage === 1}
                >
                    Previous
                </Button>
                <span>
                    Page {currentPopularPage} of {totalPopularPages}
                </span>
                <Button
                    variant="outline"
                    onClick={handlePopularNextPage}
                    disabled={currentPopularPage === totalPopularPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
