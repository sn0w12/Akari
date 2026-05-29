import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GRID_CLASS } from "../grid-page";
import MangaCardSkeleton from "../manga/manga-card-skeleton";
import { ServerPagination } from "../ui/pagination/server-pagination";

export default function HomeSkeleton() {
    return (
        <>
            <div className="mx-auto px-4 pt-2 pb-4">
                <h2 className="text-3xl font-semibold mb-2">Popular Manga</h2>
                <div className={GRID_CLASS}>
                    {Array.from({ length: 12 }, (_, i) => i).map((i) => (
                        <MangaCardSkeleton key={`skeleton-${i}`} />
                    ))}
                </div>
                <div className="flex justify-between items-center mt-6 p-4 border-t border-b">
                    <Button variant="outline" disabled>
                        Previous
                    </Button>
                    <Skeleton className="h-4 w-24" />
                    <Button variant="outline" disabled>
                        Next
                    </Button>
                </div>

                <h2 className={`text-3xl font-semibold my-2`}>
                    Latest Releases
                </h2>

                <div className={GRID_CLASS}>
                    {Array.from({ length: 24 }, (_, i) => i).map((i) => (
                        <MangaCardSkeleton key={`skeleton-${i}`} />
                    ))}
                </div>
            </div>
            <ServerPagination currentPage={1} totalPages={400} href="/latest" />
        </>
    );
}
