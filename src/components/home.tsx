import ErrorComponent from "./error-page";
import { ServerPagination } from "./ui/pagination/server-pagination";
import { PopularManga } from "./home/popular-manga";
import { MangaGrid } from "./manga/manga-grid";
import { getLatestManga } from "@/lib/manga/scraping";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { isApiErrorData } from "@/lib/api";

export default async function MangaReaderHome({
    currentPage,
}: {
    currentPage: number;
}) {
    "use cache";
    cacheLife("minutes");

    const mangaData = await getLatestManga(currentPage.toString());

    if (isApiErrorData(mangaData)) {
        return (
            <ErrorComponent
                message={`Failed to load manga data: ${mangaData.message}`}
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
                    className={`text-3xl font-bold mb-6 ${
                        currentPage === 1 ? "mt-6" : ""
                    }`}
                >
                    Latest Releases
                </h2>
                <MangaGrid mangaList={mangaList} />
            </div>
            <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                className="mb-4"
            />
        </div>
    );
}
