"use client";

import { useEffect, useState } from "react";
import { MangaCard } from "../manga/manga-card";
import ClientPagination from "../ui/pagination/client-pagination";
import { GRID_CLASS } from "../grid-page";

interface PopularMangaProps {
    manga: components["schemas"]["MangaResponse"][];
}

export function PopularManga({ manga }: PopularMangaProps) {
    const [currentPopularPage, setCurrentPopularPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 640 ? 6 : 12);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalPopularPages = Math.ceil(manga.length / itemsPerPage);

    const paginatedPopularList = manga.slice(
        (currentPopularPage - 1) * itemsPerPage,
        currentPopularPage * itemsPerPage
    );

    return (
        <div>
            <div className={GRID_CLASS}>
                {paginatedPopularList.map((manga, index) => (
                    <MangaCard key={index} manga={manga} />
                ))}
            </div>

            <ClientPagination
                currentPage={currentPopularPage}
                totalPages={totalPopularPages}
                handlePageChange={setCurrentPopularPage}
                className="mt-4"
            />
        </div>
    );
}
