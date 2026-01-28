import { cn } from "@/lib/utils";
import MangaCardSkeleton from "./manga/manga-card-skeleton";

export const GRID_CLASS =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4";

export async function GridBodySkeleton({
    pageSize = 24,
    className,
}: {
    pageSize?: number;
    className?: string;
}) {
    return (
        <div className={cn(GRID_CLASS, className)}>
            {[...Array(pageSize)].map((_, index) => (
                <MangaCardSkeleton key={index} />
            ))}
        </div>
    );
}
