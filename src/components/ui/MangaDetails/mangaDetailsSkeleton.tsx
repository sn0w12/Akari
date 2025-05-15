import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const details = ["Authors", "Status", "Updated", "Views"];

export default function MangaDetailsSkeleton() {
    return (
        <div className="mx-auto p-4">
            <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-8 mb-8 items-stretch h-auto">
                <div className="flex flex-shrink-0 justify-center">
                    <Skeleton
                        className="rounded-lg shadow-lg object-cover h-auto xl:h-full max-w-lg lg:min-w-full"
                        style={{ width: "400px", height: "600px" }}
                    />
                </div>

                <Card className="p-6 flex flex-col justify-between flex-grow">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <Skeleton className="h-8 w-3/4 lg:w-1/2" />
                        <div className="flex flex-shrink-0 flex-col gap-2 lg:gap-0 lg:flex-row">
                            <Skeleton className="h-10 w-10 ml-2 rounded" />
                            <Skeleton className="h-10 w-10 ml-2 rounded" />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-grow overflow-hidden">
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div>
                                {details.map((label, index) => (
                                    <div
                                        key={index}
                                        className="text-lg mb-2 flex items-center"
                                    >
                                        {label}:
                                        <Skeleton className="h-[22px] w-32 ml-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col h-full">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {[...Array(4)].map((_, index) => (
                                            <Skeleton
                                                key={index}
                                                className="h-6 w-20"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 lg:mb-4 flex-grow h-full">
                                    <Skeleton className="hidden lg:flex w-full h-full min-h-16 rounded-xl" />
                                </div>
                            </div>
                            <div className="flex flex-col xl:flex-row gap-4 mt-auto">
                                <Skeleton className="h-10 w-full xl:w-1/2" />
                                <Skeleton className="h-10 w-full xl:w-1/2" />
                            </div>
                        </div>
                        <div className="lg:w-1/2 flex-grow h-full">
                            <Card className="w-full h-full max-h-96 lg:max-h-none p-4 overflow-y-auto">
                                <Skeleton className="h-48 lg:h-full w-full" />
                            </Card>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Chapters</h2>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={true}>
                        Find Latest Read
                    </Button>
                    <Button variant="outline" disabled={true}>
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort Ascending
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(24)].map((_, index) => (
                    <Card key={index} className="h-full">
                        <CardContent className="p-4">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center">
                <Skeleton className="h-10 w-64" />
            </div>
        </div>
    );
}
