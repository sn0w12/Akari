import { client } from "@/lib/api";
import { serverHeaders } from "@/lib/api";
import type { GetPaths, PaginatedResponse } from "@/types/api-utils";

export const STATIC_GENERATION_DISABLED =
    !process.env.API_KEY || process.env.DISABLE_STATIC_GENERATION === "1";

export async function getAllPaginated<T>(
    path: GetPaths,
    pageSize: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (item: any) => T,
    maxPages?: number
): Promise<T[]> {
    try {
        const allItems: T[] = [];
        let page = 1;
        let totalPages = 2;

        while (page <= totalPages) {
            const { data, error } = await client.GET(path, {
                params: {
                    query: {
                        page,
                        pageSize,
                    },
                },
                headers: serverHeaders,
            });

            if (error || !data) {
                console.error(
                    `Failed to fetch page ${page} for ${path}:`,
                    error
                );
                break;
            }

            if (
                typeof data.data === "object" &&
                data.data !== null &&
                "items" in data.data &&
                "totalPages" in data.data
            ) {
                const responseData = data.data as PaginatedResponse<unknown>;
                if (page === 1) {
                    totalPages = responseData.totalPages;
                    if (maxPages) {
                        totalPages = Math.min(totalPages, maxPages);
                    }
                }

                allItems.push(...responseData.items.map(transform));
                page++;
            } else {
                console.error(
                    `Unexpected response format for page ${page} on ${path}:`,
                    data.data
                );
                break;
            }
        }

        return allItems;
    } catch (error) {
        console.error(`Error fetching all items for ${path}:`, error);
        return [];
    }
}

export async function getAllMangaIds(maxPages?: number): Promise<string[]> {
    return getAllPaginated("/v2/manga/ids", 1000, (id: string) => id, maxPages);
}

interface ChapterIdsResponse {
    mangaId: string;
    chapterIds: number[];
}

export async function getAllChapterIds(
    maxPages?: number
): Promise<ChapterIdsResponse[]> {
    return getAllPaginated(
        "/v2/manga/chapter/ids",
        500,
        (item: ChapterIdsResponse) => item,
        maxPages
    );
}

export async function getAllAuthors(maxPages?: number): Promise<string[]> {
    return getAllPaginated(
        "/v2/author/list",
        500,
        (author: components["schemas"]["AuthorResponse"]) =>
            author.name.replaceAll(" ", "-"),
        maxPages
    );
}
