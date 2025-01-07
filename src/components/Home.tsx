import ErrorComponent from "./ui/error";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { PopularManga } from "./ui/Home/PopularManga";
import { MangaListResponse } from "@/app/api/interfaces";
import { MangaCard } from "./ui/Home/MangaCard";
import { scrapeMangaHome } from "@/lib/mangaNato";

export const revalidate = 60; // 1 minute

export default async function MangaReaderHome({
    searchParams,
}: {
    searchParams: { page: string };
}) {
    const currentPage = Number(searchParams.page) || 1;

    let mangaData: MangaListResponse = {} as MangaListResponse;
    let error: string | null = null;
    try {
        const data = await scrapeMangaHome(currentPage);
        if ("result" in data) {
            error = String(data.data);
            return <ErrorComponent message={error} />;
        } else {
            mangaData = data;
        }
    } catch (error) {
        return (
            <ErrorComponent message={`Failed to load manga data: ${error}`} />
        );
    }

    const { mangaList, popular, metaData } = mangaData;
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
