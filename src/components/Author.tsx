import { SortSelect } from "./ui/SortSelect";
import nextBase64 from "next-base64";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { getProductionUrl } from "@/app/api/baseUrl";
import { MangaCard } from "./ui/Home/MangaCard";
import { SmallManga } from "@/app/api/interfaces";

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
    try {
        const response = await fetch(
            `${getProductionUrl()}/api/author/${authorId}?orderBy=${sort}&page=${page}`,
            { cache: "no-store" },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch manga list");
        }

        return (await response.json()) as MangaListResponse;
    } catch (error) {
        throw new Error(`Error fetching manga list: ${error}`);
    }
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    let mangaList: SmallManga[] = [];
    let totalPages = 1;
    let error = null;

    try {
        const data = await getMangaList(params.id, currentPage, currentSort);
        mangaList = data.mangaList;
        totalPages = data.metaData.totalPages;
    } catch (err) {
        error = `${err}`;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>
                        {nextBase64
                            .decode(params.id)
                            .replaceAll("_", " ")
                            .replaceAll("|", " ")
                            .split(" ")
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                            )
                            .join(" ")}
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

            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={[{ key: "sort", value: currentSort }]}
            />
        </div>
    );
}
