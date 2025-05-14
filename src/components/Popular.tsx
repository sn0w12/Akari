import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { getPopularManga } from "@/lib/scraping";
import { MangaGrid } from "./MangaGrid";

interface PageProps {
    searchParams: { page?: string };
}

export default async function PopularPage({ searchParams }: PageProps) {
    "use cache";

    const currentPage = Number(searchParams.page) || 1;
    const mangaData = await getPopularManga(currentPage.toString());

    if ("error" in mangaData) {
        return (
            <ErrorComponent
                message={`Failed to load manga data: ${mangaData.error}`}
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
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
