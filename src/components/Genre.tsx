import { SortSelect } from "./ui/SortSelect";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { SmallManga } from "@/app/api/interfaces";
import { MangaGrid } from "./MangaGrid";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { fetchGenreData } from "@/lib/scraping";

interface MangaListResponse {
    mangaList: SmallManga[];
    popular: SmallManga[];
    metaData: { totalStories: number; totalPages: number };
}

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
        currentSort,
    );

    if ("error" in data) {
        return (
            <ErrorComponent
                message={`Failed to load manga data: ${data.error}`}
            />
        );
    }

    const { mangaList, metaData } = data as MangaListResponse;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-1 pb-4">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>
                        {decodeURIComponent(params.id).replaceAll("_", " ")}
                    </h2>
                    <SortSelect currentSort={currentSort} />
                </div>

                <MangaGrid mangaList={mangaList} />
            </div>

            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={[{ key: "sort", value: currentSort }]}
            />
        </div>
    );
}
