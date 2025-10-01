import { Skeleton } from "@/components/ui/skeleton";
import MangaCardSkeleton from "../manga/manga-card-skeleton";

export default function GenreSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 py-1">
                <Skeleton className="h-[36px] mb-6 w-96" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(24)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
