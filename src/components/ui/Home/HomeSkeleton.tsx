import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PaginationElement } from "../Pagination/ServerPaginationElement";
import MangaCardSkeleton from "./MangaCardSkeleton";

export default function HomeSkeleton({ currentPage }: { currentPage: number }) {
    return (
        <>
            <main className="mx-auto px-4 py-1">
                {currentPage === 1 && (
                    <>
                        <h2 className="text-3xl font-bold mb-6">
                            Popular Manga
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, index) => (
                                <MangaCardSkeleton key={index} />
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-6 px-4 py-4 border-t border-b">
                            <Button variant="outline" disabled>
                                Previous
                            </Button>
                            <Skeleton className="h-4 w-24" />
                            <Button variant="outline" disabled>
                                Next
                            </Button>
                        </div>
                    </>
                )}

                <h2
                    className={`text-3xl font-bold mb-6 ${
                        currentPage === 1 ? "mt-6" : ""
                    }`}
                >
                    Latest Releases
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(24)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
            </main>
            <PaginationElement
                currentPage={currentPage}
                totalPages={currentPage}
            />
        </>
    );
}
