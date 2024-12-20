"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmallManga } from "@/app/api/interfaces";

interface PopularMangaProps {
    mangas: SmallManga[];
}

export function PopularManga({ mangas }: PopularMangaProps) {
    const [currentPopularPage, setCurrentPopularPage] = useState(1);
    const itemsPerPage = 12;
    const totalPopularPages = Math.ceil(mangas.length / itemsPerPage);

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

    const paginatedPopularList = mangas.slice(
        (currentPopularPage - 1) * itemsPerPage,
        currentPopularPage * itemsPerPage,
    );

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {paginatedPopularList.map((manga, index) => (
                    <Link
                        href={`/manga/${manga.id}`}
                        key={manga.id}
                        className="block"
                    >
                        <Card className="group relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
                            <CardContent className="p-0">
                                <Image
                                    loading={
                                        index * currentPopularPage < 12
                                            ? "eager"
                                            : "lazy"
                                    }
                                    src={manga.image}
                                    alt={manga.title}
                                    width={250}
                                    height={350}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 transition-transform duration-300 ease-in-out">
                                        <h3 className="font-bold text-sm mb-1 opacity-100 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                            {manga.title}
                                        </h3>
                                        <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                            Chapter: {manga.chapter}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
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
