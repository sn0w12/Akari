import ErrorComponent from "./error-page";
import { getPopularManga } from "@/lib/manga/scraping";
import { MangaGrid } from "./manga/manga-grid";
import { ServerPagination } from "./ui/pagination/server-pagination";
import { isApiErrorData } from "@/lib/api";

interface PageProps {
    searchParams: { page?: string };
}

export default async function PopularPage({ searchParams }: PageProps) {
    "use cache";

    const currentPage = Number(searchParams.page) || 1;
    const mangaData = await getPopularManga(currentPage.toString());

    if (isApiErrorData(mangaData)) {
        return (
            <ErrorComponent
                message={`Failed to load manga data: ${mangaData.message}`}
            />
        );
    }

    const { mangaList, metaData } = mangaData;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-1 pb-4">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>Popular Manga</h2>
                </div>

                <MangaGrid mangaList={mangaList} />
            </div>
            <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
