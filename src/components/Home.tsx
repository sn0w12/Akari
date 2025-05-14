import ErrorComponent from "./ui/error";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { PopularManga } from "./ui/Home/PopularManga";
import { MangaGrid } from "./MangaGrid";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { getLatestManga } from "@/lib/scraping";

export default async function MangaReaderHome({
    searchParams,
}: {
    searchParams: { page: string };
}) {
    "use cache";
    cacheLife("minutes");

    const currentPage = Number(searchParams.page) || 1;
    const mangaData = await getLatestManga(currentPage.toString());

    if ("error" in mangaData) {
        return (
            <ErrorComponent
                message={`Failed to load manga data: ${mangaData.error}`}
            />
        );
    }

    const { mangaList, popular, metaData } = mangaData;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-1 pb-4">
                {currentPage === 1 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">
                            Popular Manga
                        </h2>
                        <PopularManga mangas={popular.slice(0, -1)} />
                    </div>
                )}

                <h2
                    className={`text-3xl font-bold mb-6 ${currentPage === 1 ? "mt-6" : ""}`}
                >
                    Latest Releases
                </h2>
                <MangaGrid mangaList={mangaList} />
            </div>
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
