import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import PaginationElement from "../Pagination/ClientPaginationElement";

const imgSize = "w-full h-auto aspect-[8.5/12] xl:h-[260px] 2xl:h-[340px]";

export default function HomeSkeleton(currentPage: number) {
    return (
        <>
            <main className="container mx-auto px-4 py-8">
                {currentPage === 1 && (
                    <>
                        <h2 className="text-3xl font-bold mb-6">
                            Popular Manga
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, index) => (
                                <Card
                                    key={index}
                                    className="group relative overflow-hidden"
                                >
                                    <CardContent className="p-0">
                                        <Skeleton className={imgSize} />
                                    </CardContent>
                                </Card>
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
                        <Card
                            key={index}
                            className="group relative overflow-hidden"
                        >
                            <CardContent className="p-0">
                                <Skeleton className={imgSize} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
            <PaginationElement
                currentPage={currentPage}
                totalPages={currentPage}
                handlePageChange={() => {}}
            />
        </>
    );
}
