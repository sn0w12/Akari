import { GridSortSelect, Sorting } from "./grid/grid-sort";
import MangaCardSkeleton from "./manga/manga-card-skeleton";
import { MangaGrid } from "./manga/manga-grid";
import { ServerPagination } from "./ui/pagination/server-pagination";
import { Skeleton } from "./ui/skeleton";

interface PageProps {
    title: string;
    mangaList: components["schemas"]["MangaResponse"][];
    currentPage: number;
    totalPages: number;
    sorting?: Sorting;
}

export const GRID_CLASS =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4";

export default async function GridPage({
    title,
    mangaList,
    currentPage,
    totalPages,
    sorting,
}: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground mx-auto px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                {sorting && (
                    <div className="ml-auto">
                        <GridSortSelect sorting={sorting} />
                    </div>
                )}
            </div>

            <MangaGrid mangaList={mangaList} />

            <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                className="mt-4"
            />
        </div>
    );
}

export async function GridPageSkeleton({
    pageSize = 24,
}: {
    pageSize?: number;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-2 pb-4">
                <Skeleton className="h-[36px] mb-2 w-96" />
                <div className={GRID_CLASS}>
                    {[...Array(pageSize)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export async function GridBodySkeleton({
    pageSize = 24,
}: {
    pageSize?: number;
}) {
    return (
        <div className={GRID_CLASS}>
            {[...Array(pageSize)].map((_, index) => (
                <MangaCardSkeleton key={index} />
            ))}
        </div>
    );
}
