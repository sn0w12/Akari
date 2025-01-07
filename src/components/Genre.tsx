import { SortSelect } from "./ui/SortSelect";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { MangaCard } from "./ui/Home/MangaCard";
import { SmallManga } from "@/app/api/interfaces";
import { fetchMangaGenre } from "@/app/api/genre/route";

interface PageProps {
    params: { id: string };
    searchParams: { page?: string; sort?: string };
}

export default async function GenrePage({ params, searchParams }: PageProps) {
    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    let mangaList: SmallManga[] = [];
    let totalPages = 1;
    let error: string | null = null;

    try {
        const data = await fetchMangaGenre(
            [params.id],
            [],
            currentSort,
            Number(currentPage),
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
            <main className="container mx-auto px-4 py-8">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>
                        {params.id.replaceAll("_", " ")}
                    </h2>
                    <SortSelect currentSort={currentSort} />
                </div>

                {error && <ErrorComponent message={error} />}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {mangaList.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} />
                    ))}
                </div>
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
