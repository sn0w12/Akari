import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ServerPagination } from "../ui/pagination/server-pagination";
import MangaCardSkeleton from "../manga/manga-card-skeleton";

export default function HomeSkeleton() {
    return (
        <>
            <div className="mx-auto px-4 pt-1 pb-4">
                <h2 className="text-3xl font-bold mb-6">Popular Manga</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(12)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
                <div className="flex justify-between items-center mt-6 px-4 py-4 border-t border-b">
                    <Button variant="outline" disabled>
                        Previous
                    </Button>
                    <Skeleton className="h-4 w-24" />
                    <Button variant="outline" disabled>
                        Next
                    </Button>
                </div>

                <h2 className={`text-3xl font-bold my-6`}>Latest Releases</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(24)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
            </div>
            <ServerPagination currentPage={1} totalPages={400} />
        </>
    );
}
