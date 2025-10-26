import { ServerPagination } from "./ui/pagination/server-pagination";
import ErrorComponent from "./error-page";
import { MangaGrid } from "./manga/manga-grid";
import { cacheLife } from "next/cache";
import { fetchGenreData } from "@/lib/manga/scraping";
import { isApiErrorData } from "@/lib/api";

interface PageProps {
    params: { id: string };
    searchParams: { page?: string; sort?: string };
}

export default async function GenrePage({ params, searchParams }: PageProps) {
    "use cache";
    cacheLife("minutes");

    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    const data = await fetchGenreData(
        params.id,
        String(currentPage),
        currentSort
    );

    if (isApiErrorData(data)) {
        return (
            <ErrorComponent
                message={`Failed to load manga data: ${data.message}`}
            />
        );
    }

    const { mangaList, metaData } = data;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-1 pb-4">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>
                        {decodeURIComponent(params.id).replaceAll("_", " ")}
                    </h2>
                </div>

                <MangaGrid mangaList={mangaList} />
            </div>

            <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={[{ key: "sort", value: currentSort }]}
                className="mb-4"
            />
        </div>
    );
}
