import { Skeleton } from "@/components/ui/skeleton";

export async function ButtonsSkeleton() {
    return (
        <div className="flex flex-col xl:flex-row gap-4 mt-auto">
            <Skeleton className="h-11 w-full xl:w-1/2" />
            <Skeleton className="h-11 w-full xl:w-1/2" />
        </div>
    );
}
