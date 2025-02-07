import ErrorComponent from "./ui/error";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { getProductionUrl } from "@/app/api/baseUrl";
import { PopularManga } from "./ui/Home/PopularManga";
import { SmallManga } from "@/app/api/interfaces";
import { MangaGrid } from "./MangaGrid";
import { unstable_cacheLife as cacheLife } from "next/cache";

interface MangaListResponse {
    mangaList: SmallManga[];
    popular: SmallManga[];
    metaData: {
        totalStories: number;
        totalPages: number;
    };
}

async function getMangaData(page: number): Promise<MangaListResponse> {
    const baseUrl = getProductionUrl();
    const url = `${baseUrl}/api/manga-list/latest?page=${page}`;

    const res = await fetch(url);
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch error details:", {
            error: errorText,
            status: res.status,
            url,
        });
        throw new Error(
            `Failed to fetch manga data: ${res.status} ${res.statusText}`,
        );
    }

    return res.json();
}

export default async function MangaReaderHome({
    searchParams,
}: {
    searchParams: { page: string };
}) {
    "use cache";
    cacheLife("minutes");

    const currentPage = Number(searchParams.page) || 1;
    let mangaData: MangaListResponse;
    try {
        mangaData = await getMangaData(currentPage);
    } catch (error) {
        return (
            <ErrorComponent message={`Failed to load manga data: ${error}`} />
        );
    }

    const { mangaList, popular, metaData } = mangaData;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                {currentPage === 1 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">
                            Popular Manga
                        </h2>
                        <PopularManga mangas={popular.slice(0, -1)} />
                    </div>
                )}

                <h2
                    className={`text-3xl font-bold mb-6 ${currentPage === 1 ? "mt-6" : ""}`}
                >
                    Latest Releases
                </h2>
                <MangaGrid mangaList={mangaList} />
            </main>
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
