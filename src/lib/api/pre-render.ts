import { env } from "@/lib/env";
import { client } from "@/lib/api";
import { serverHeaders } from "@/lib/api";
import type { GetPaths, PaginatedResponse } from "@/types/api-utils";

export const STATIC_GENERATION_DISABLED =
    !env("API_KEY") || process.env.DISABLE_STATIC_GENERATION === "1";

export async function getAllPaginated<T>(
    path: GetPaths,
    pageSize: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (item: any) => T,
    maxPages?: number,
): Promise<T[]> {
    try {
        const allItems: T[] = [];

        const { data: firstData, error: firstError } = await client.GET(path, {
            params: {
                query: {
                    page: 1,
                    pageSize,
                },
            },
            headers: serverHeaders,
        });

        if (firstError || !firstData) {
            console.error(`Failed to fetch page 1 for ${path}:`, firstError);
            return [];
        }

        if (
            typeof firstData.data !== "object" ||
            firstData.data === null ||
            !("items" in firstData.data) ||
            !("totalPages" in firstData.data)
        ) {
            console.error(
                `Unexpected response format for page 1 on ${path}:`,
                firstData.data,
            );
            return [];
        }

        const responseData = firstData.data as PaginatedResponse<unknown>;
        let totalPages = responseData.totalPages;
        if (maxPages) {
            totalPages = Math.min(totalPages, maxPages);
        }

        allItems.push(...responseData.items.map(transform));

        if (totalPages > 1) {
            const pagePromises = [];
            for (let page = 2; page <= totalPages; page++) {
                pagePromises.push(
                    client.GET(path, {
                        params: { query: { page, pageSize } },
                        headers: serverHeaders,
                    }),
                );
            }

            const results = await Promise.all(pagePromises);

            for (const { data, error } of results) {
                if (error || !data) {
                    console.error(
                        `Failed to fetch page for ${path}:`,
                        error,
                    );
                    break;
                }

                if (
                    typeof data.data === "object" &&
                    data.data !== null &&
                    "items" in data.data
                ) {
                    const responseData =
                        data.data as PaginatedResponse<unknown>;
                    allItems.push(...responseData.items.map(transform));
                }
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
    maxPages?: number,
): Promise<ChapterIdsResponse[]> {
    return getAllPaginated(
        "/v2/manga/chapter/ids",
        500,
        (item: ChapterIdsResponse) => item,
        maxPages,
    );
}

export async function getAllAuthors(maxPages?: number): Promise<string[]> {
    return getAllPaginated(
        "/v2/author/list",
        500,
        (author: components["schemas"]["AuthorResponse"]) =>
            author.name.replaceAll(" ", "-"),
        maxPages,
    );
}
