import { SortSelect } from "./ui/SortSelect";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { MangaGrid } from "./MangaGrid";
import { SmallManga } from "@/app/api/interfaces";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { fetchAuthorData } from "@/lib/scraping";

interface PageProps {
    params: { id: string };
    searchParams: { page?: string; sort?: string };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
    "use cache";
    cacheLife("minutes");

    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    let mangaList: SmallManga[] = [];
    let totalPages = 1;
    let error: string | null = null;

    try {
        const data = await fetchAuthorData(
            params.id,
            String(currentPage),
            currentSort,
        );

        if ("result" in data) {
            error = String(data.data);
        } else {
            mangaList = data.mangaList;
            totalPages = data.metaData.totalPages;
        }
    } catch (err) {
        error = err instanceof Error ? err.message : String(err);
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="mx-auto px-4 pt-1 pb-4">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>
                        {params.id.replaceAll("-", " ")}
                    </h2>
                    <SortSelect currentSort={currentSort} />
                </div>

                {error && <ErrorComponent message={error} />}
                <MangaGrid mangaList={mangaList} />
            </main>

            {!error && (
                <PaginationElement
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchParams={[{ key: "sort", value: currentSort }]}
                />
            )}
        </div>
    );
}
