import MangaCardSkeleton from "../manga/manga-card-skeleton";

export default function PopularSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 py-1">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>Popular Manga</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(24)].map((_, index) => (
                        <MangaCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
