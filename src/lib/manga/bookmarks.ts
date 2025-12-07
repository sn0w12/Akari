import { client } from "../api";

export async function fetchBookmarks(page: number) {
    try {
        const { data, error } = await client.GET("/v2/bookmarks", {
            params: {
                query: {
                    page: page,
                },
            },
        });

        if (error) {
            return error;
        }

        return data;
    } catch {
        return null;
    }
}

export const fetchNotification = async () => {
    try {
        const { data, error } = await client.GET("/v2/bookmarks/unread");

        if (error) {
            return "";
        }

        if (data.data) {
            navigator.setAppBadge(Number(data.data));
        }

        return data.data.toString();
    } catch (error) {
        console.error("Error fetching notification:", error);
        return "";
    }
};

export async function checkIfBookmarked(mangaId: string): Promise<boolean> {
    const manga = await getLatestReadChapter(mangaId);
    if (!manga) {
        return false;
    }
    return true;
}

export async function bookmarkManga(mangaId: string, chapter?: number) {
    const { error } = await client.PUT("/v2/bookmarks/{mangaId}", {
        params: {
            path: {
                mangaId: mangaId,
            },
        },
        body: {
            chapterNumber: chapter || undefined,
        },
    });

    if (error) {
        return false;
    }

    return true;
}

export async function updateBookmark(
    data: components["schemas"]["ChapterResponse"]
) {
    return await bookmarkManga(data.mangaId, data.number);
}

export async function removeBookmark(mangaId: string) {
    const { error } = await client.DELETE("/v2/bookmarks/{mangaId}", {
        params: {
            path: {
                mangaId: mangaId,
            },
        },
    });

    if (error) {
        return false;
    }

    return true;
}

export async function getLatestReadChapter(mangaId: string) {
    const { data, error } = await client.GET("/v2/bookmarks/{mangaId}", {
        params: {
            path: {
                mangaId: mangaId,
            },
        },
    });

    if (error) {
        return null;
    }

    return data.data;
}
