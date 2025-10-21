"use client";

import { useEffect, useState } from "react";
import { SmallManga } from "@/types/manga";
import { MangaCard } from "../manga/manga-card";
import ClientPagination from "../ui/pagination/client-pagination";

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

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalPopularPages = Math.ceil(mangas.length / itemsPerPage);

    useEffect(() => {
        setCurrentPopularPage(1);
    }, [itemsPerPage]);

    const paginatedPopularList = mangas.slice(
        (currentPopularPage - 1) * itemsPerPage,
        currentPopularPage * itemsPerPage
    );

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {paginatedPopularList.map((manga, index) => (
                    <MangaCard
                        key={index}
                        manga={manga}
                        loading="eager"
                        priority={index <= 4}
                        isBookmarked={false}
                    />
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
