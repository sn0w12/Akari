import ErrorComponent from "./ui/error";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { PopularManga } from "./ui/Home/PopularManga";
import { MangaCard } from "./ui/Home/MangaCard";
import { fetchMangaHome } from "@/app/api/manga-list/latest/route";
import { MangaListResponse } from "@/app/api/interfaces";

export default async function MangaReaderHome({
    searchParams,
}: {
    searchParams: { page: string };
}) {
    const currentPage = Number(searchParams.page) || 1;
    const mangaData = await fetchMangaHome(currentPage);

    if ("error" in mangaData) {
        const errorMessage =
            typeof mangaData.error === "string"
                ? mangaData.error
                : "An error occurred";
        return <ErrorComponent message={errorMessage} />;
    }

    if (!mangaData || !(mangaData as MangaListResponse).popular) {
        return <ErrorComponent message="Failed to load manga data" />;
    }

    const { mangaList, popular, metaData } = mangaData as MangaListResponse;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                {currentPage === 1 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">
                            Popular Manga
                        </h2>
                        <PopularManga mangas={popular?.slice(0, -1) || []} />
                    </div>
                )}

                <h2
                    className={`text-3xl font-bold mb-6 ${currentPage === 1 ? "mt-6" : ""}`}
                >
                    Latest Releases
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {mangaList.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} />
                    ))}
                </div>
            </main>
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
