import MangaCardSkeleton from "./manga/manga-card-skeleton";

export const GRID_CLASS =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4";

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
