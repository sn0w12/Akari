import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BookmarkCardSkeleton() {
    return (
        <Card className="overflow-hidden p-0">
            <div className="flex flex-col gap-2 p-4">
                <div className="flex gap-2">
                    {/* Cover Image */}
                    <div className="w-20 lg:w-30 h-full mb-0 shrink-0">
                        <Skeleton
                            className="w-full h-auto object-cover rounded-sm"
                            style={{ aspectRatio: "2 / 3" }}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                        {/* Title */}
                        <div>
                            <div className="flex items-center gap-2 justify-between">
                                <Skeleton className="h-6 w-40" />
                                <div className="flex flex-row items-center gap-2 self-start">
                                    <Skeleton className="size-8 rounded-sm" />
                                    <Skeleton className="size-8 rounded-sm" />
                                </div>
                            </div>

                            <span className="flex items-center gap-1.5 text-muted-foreground text-sm leading-4">
                                <Skeleton className="h-4 w-28" />
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground text-sm leading-4">
                                <Skeleton className="h-4 w-32" />
                            </span>
                        </div>
                        <Skeleton className="h-8 w-full hidden md:flex" />
                    </div>
                </div>
                <Skeleton className="h-8 w-full md:hidden" />
            </div>
        </Card>
    );
}

export default function BookmarksSkeleton() {
    return (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 xl:gap-6">
            {[...Array(24)].map((_, index) => (
                <BookmarkCardSkeleton key={`skeleton-card-${index}`} />
            ))}
        </div>
    );
}
