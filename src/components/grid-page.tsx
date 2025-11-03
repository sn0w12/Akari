import { ServerPagination } from "./ui/pagination/server-pagination";
import { MangaGrid } from "./manga/manga-grid";
import { Skeleton } from "./ui/skeleton";
import MangaCardSkeleton from "./manga/manga-card-skeleton";

interface PageProps {
    title: string;
    mangaList: components["schemas"]["MangaResponse"][];
    currentPage: number;
    totalPages: number;
    currentSort?: string;
}

export default async function GridPage({
    title,
    mangaList,
    currentPage,
    totalPages,
    currentSort,
}: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-2 pb-4">
                <div className="flex gap-4">
                    <h2 className="text-3xl font-bold mb-2">{title}</h2>
                </div>

                <MangaGrid mangaList={mangaList} />
            </div>

            <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={[{ key: "sort", value: currentSort || "" }]}
                className="mb-4"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(pageSize)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
