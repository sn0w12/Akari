import { SortSelect } from "./ui/SortSelect";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { getProductionUrl } from "@/app/api/baseUrl";
import { MangaGrid } from "./MangaGrid";
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
    params: { id: string };
    searchParams: { page?: string; sort?: string };
}

async function getMangaList(authorId: string, page: number, sort: string) {
    "use cache";

    try {
        const response = await fetch(
            `${getProductionUrl()}/api/author/${authorId}?orderBy=${sort}&page=${page}`,
        );

        if (!response.ok) {
            return (await response.json()) as SimpleError;
        }

        return (await response.json()) as MangaListResponse;
    } catch (error) {
        throw new Error(`Error fetching manga list: ${error}`);
    }
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
    "use cache";

    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    let mangaList: SmallManga[] = [];
    let totalPages = 1;
    let error: string | null = null;

    try {
        const data = await getMangaList(params.id, currentPage, currentSort);

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
