import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function desktopCard(index: number) {
    return (
        <Card
            key={`desktop-${index}`}
            className="hidden md:flex flex-row items-start p-6 shadow-lg bg-card border border-border rounded-lg xl:h-full"
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
                    <div className="flex flex-col gap-1">
                        <Skeleton className="w-44 h-5" />
                        <Skeleton className="w-28 h-3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function mobileCard(index: number) {
    return (
        <Card
            key={`mobile-${index}`}
            className="flex md:hidden flex-col items-start shadow-lg bg-card border border-border rounded-lg"
        >
            <CardContent className="pt-6 flex flex-col flex-shrink justify-between w-full">
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
                <div className="flex flex-col gap-1">
                    <Skeleton className="w-44 h-5" />
                    <Skeleton className="w-28 h-3" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function BookmarksSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="mx-auto p-4">
                <div className="relative mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className={
                                "w-auto md:h-auto flex items-center justify-center"
                            }
                            disabled={true}
                        >
                            Export Bookmarks
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className={
                                "w-auto md:h-auto flex items-center justify-center bg-blue-600 hover:bg-blue-500"
                            }
                            disabled={true}
                        >
                            Sync Bookmarks
                        </Button>
                        <div className="relative w-full">
                            <Input
                                type="search"
                                placeholder={
                                    "Loading bookmarks, please wait..."
                                }
                                disabled={true}
                                className="no-cancel"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
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
            </main>
        </div>
    );
}
