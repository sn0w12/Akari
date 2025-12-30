import { Skeleton } from "../ui/skeleton";

export async function ListSkeleton() {
    return (
        <div className="space-y-2 px-4 pb-4 pt-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60" />
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
