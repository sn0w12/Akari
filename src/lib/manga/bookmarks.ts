import { client } from "../api";

export async function fetchBookmarks(page: number) {
    try {
        const { data, error } = await client.GET("/v2/bookmarks", {
            query: {
                page: page,
            },
        });

        if (error) {
            throw new Error(error.data.message || "Failed to fetch bookmarks");
        }

        return data.data;
    } catch (err) {
        console.error("Error fetching bookmarks:", err);
        return {
            message: "An error occurred while fetching bookmarks.",
        };
    }
}

const notificationName = "akari-notification";
const notificationTimestampName = "akari-notification-timestamp";
const notificationCacheDuration = 1 * 60 * 60 * 1000;

export const fetchNotification = async () => {
    const cached = localStorage.getItem(notificationName);
    const timestamp = localStorage.getItem(notificationTimestampName);
    const now = Date.now();

    if (
        cached &&
        timestamp &&
        now - parseInt(timestamp) < notificationCacheDuration
    ) {
        return cached;
    }

    try {
        const { data, error } = await client.GET("/v2/bookmarks/unread");

        if (error) {
            localStorage.removeItem(notificationName);
            localStorage.removeItem(notificationTimestampName);
            if (error.status === 401) {
                localStorage.removeItem("auth");
                localStorage.removeItem("accountName");
            }
            return "";
        }

        localStorage.setItem(notificationName, data.data.toString());
        localStorage.setItem(notificationTimestampName, now.toString());
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
