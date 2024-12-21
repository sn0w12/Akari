import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const imgSize = "w-full h-auto aspect-[8.5/12] xl:h-[260px] 2xl:h-[340px]";

export default function AuthorSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                <Skeleton className="h-[36px] mb-6 w-96" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, index) => (
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
        </div>
    );
}
