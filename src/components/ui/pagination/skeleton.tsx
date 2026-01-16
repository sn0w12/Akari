import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PaginationSkeletonProps {
    className?: string;
}

export function PaginationSkeleton({ className }: PaginationSkeletonProps) {
    return (
        <nav
            className={cn(
                "flex items-center justify-between w-full max-w-md mx-auto",
                className,
            )}
            aria-label="Loading pagination"
        >
            {/* Previous Button Skeleton - Fixed left position */}
            <Skeleton className="min-w-9 h-9 flex-shrink-0 sm:min-w-[90px]" />

            {/* Page Numbers Skeleton - Fixed center container */}
            <div className="flex items-center justify-center gap-1 flex-1">
                <Skeleton className="min-w-9 h-9" />
                <Skeleton className="min-w-9 h-9 hidden sm:inline-flex" />
                <Skeleton className="min-w-9 h-9" />
                <Skeleton className="min-w-9 h-9 hidden sm:inline-flex" />
                <Skeleton className="min-w-9 h-9" />
            </div>

            {/* Next Button Skeleton - Fixed right position */}
            <Skeleton className="min-w-9 h-9 flex-shrink-0 sm:min-w-[90px]" />
        </nav>
    );
}
