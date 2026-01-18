import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown } from "lucide-react";

export async function ChaptersSkeleton() {
    return (
        <>
            <div className="flex gap-2 w-full md:hidden mb-2">
                <Button className="flex-1" disabled={true}>
                    Find Latest Read
                </Button>
                <Button className="flex-1" disabled={true}>
                    <ArrowUpDown className="h-4 w-4" />
                    Sort Ascending
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {[...Array(24)].map((_, index) => (
                    <Card key={index} className="h-full p-0">
                        <CardContent className="p-4">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
