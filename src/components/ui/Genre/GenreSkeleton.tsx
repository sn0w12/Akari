import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const imgSize = "w-full h-auto aspect-[8.5/12] xl:h-[260px] 2xl:h-[340px]";

export default function GenreSkeleton() {
    return (
        <>
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
        </>
    );
}
