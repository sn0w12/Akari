import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

function desktopCard(index: number) {
    return (
        <Card
            key={`desktop-${index}`}
            className="hidden md:flex flex-row items-start p-6 pr-2  bg-card border border-border rounded-lg xl:h-full"
        >
            <div className="w-40 h-full mb-0 shrink-0">
                {/* Skeleton for the image */}
                <Skeleton className="w-full h-60 object-cover rounded" />
            </div>

            <CardContent className="px-4 flex flex-col flex-shrink justify-between relative">
                <div className="flex flex-col gap-2">
                    {/* Skeleton for the story name (title) */}
                    <Skeleton className="w-48 h-8" />

                    {/* Skeleton for the button */}
                    <Skeleton className="w-72 h-10 mb-1" />

                    {/* Skeleton for Latest Chapter Info */}
                    <Skeleton className="w-44 h-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function mobileCard(index: number) {
    return (
        <Card
            key={`mobile-${index}`}
            className="flex flex-row items-start bg-card border border-border rounded-lg p-0 md:hidden"
        >
            <CardContent className="p-4 flex flex-col flex-shrink justify-between w-full">
                <div className="mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-full mb-0 shrink-0">
                            <Skeleton className="w-full h-[120px] object-cover rounded" />
                        </div>
                        <div className="flex justify-center w-full">
                            <Skeleton className="w-48 h-8 mb-2" />
                        </div>
                    </div>
                    {/* Continue Reading Button */}
                    <Skeleton className="w-full h-10 mt-2" />
                </div>
                <Skeleton className="w-44 h-5" />
            </CardContent>
        </Card>
    );
}

export default function BookmarksSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto p-4">
                <div className="relative mb-4">
                    <div className="flex flex-row gap-2 md:gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className={
                                "hidden md:flex w-auto md:h-auto items-center justify-center"
                            }
                            disabled={true}
                        >
                            Export Bookmarks
                        </Button>
                        <div className="relative w-full h-10 md:h-9">
                            <Input
                                type="search"
                                placeholder={
                                    "Loading bookmarks, please wait..."
                                }
                                disabled={true}
                                className="no-cancel text-sm h-full"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="flex size-10 md:hidden"
                            disabled={true}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 xl:gap-6">
                    {[...Array(24)].map((_, index) => (
                        <React.Fragment key={`cards-${index}`}>
                            {desktopCard(index)}
                            {mobileCard(index)}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
