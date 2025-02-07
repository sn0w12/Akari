import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { getProductionUrl } from "@/app/api/baseUrl";
import { MangaCard } from "./ui/Home/MangaCard";
import { SimpleError, SmallManga } from "@/app/api/interfaces";

interface MangaListResponse {
    mangaList: SmallManga[];
    popular: SmallManga[];
    metaData: {
        totalStories: number;
        totalPages: number;
    };
}

interface PageProps {
    searchParams: { page?: string };
}

async function getMangaList(page: number) {
    try {
        const response = await fetch(
            `${getProductionUrl()}/api/manga-list/popular?page=${page}`,
        );

        if (!response.ok) {
            return (await response.json()) as SimpleError;
        }

        return (await response.json()) as MangaListResponse;
    } catch (error) {
        throw new Error(`Error fetching manga list: ${error}`);
    }
}

export default async function PopularPage({ searchParams }: PageProps) {
    "use cache";

    const currentPage = Number(searchParams.page) || 1;
    let mangaList: SmallManga[] = [];
    let totalPages = 1;
    let error: string | null = null;

    try {
        const data = await getMangaList(currentPage);

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
                    <h2 className={`text-3xl font-bold mb-6`}>Popular Manga</h2>
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
                />
            )}
        </div>
    );
}
