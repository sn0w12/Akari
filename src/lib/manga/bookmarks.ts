import {
    Bookmark,
    Chapter,
    SmallBookmark,
    SmallBookmarkRecord,
} from "@/types/manga";
import { fetchApi, invalidateCacheKey, isApiErrorResponse } from "../api";

export async function fetchBookmarks(page: number, images: boolean = true) {
    try {
        const response = await fetchApi<{
            bookmarks: Bookmark[];
            totalPages: number;
        }>(`/api/v1/bookmarks?page=${page}&images=${images}`);

        if (isApiErrorResponse(response)) {
            if (response.status === 401) {
                localStorage.removeItem("auth");
                localStorage.removeItem("accountName");
            }

            return response.data;
        }

        return response.data;
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
        const response = await fetchApi<number>(
            `/api/v1/bookmarks/notification`
        );

        if (isApiErrorResponse(response)) {
            localStorage.removeItem(notificationName);
            localStorage.removeItem(notificationTimestampName);
            if (response.status === 401) {
                localStorage.removeItem("auth");
                localStorage.removeItem("accountName");
            }
            return "";
        }

        const data = response.data;
        localStorage.setItem(notificationName, data.toString());
        localStorage.setItem(notificationTimestampName, now.toString());
        return data.toString();
    } catch (error) {
        console.error("Error fetching notification:", error);
        return "";
    }
};

export async function checkIfBookmarked(mangaId: string): Promise<boolean> {
    const response = await fetchApi<{ isBookmarked: boolean }>(
        `/api/v1/bookmarks/bookmarked?id=${mangaId}`,
        { cacheKey: `bookmark-${mangaId}` }
    );

    if (isApiErrorResponse(response)) {
        return false;
    }

    return response.data.isBookmarked;
}

export async function bookmarkManga(mangaId: string, chapter?: Chapter) {
    const bookmarkResponse = await fetchApi<{ success: boolean }>(
        `/api/v1/bookmarks/add`,
        {
            method: "POST",
            body: JSON.stringify({
                id: mangaId,
            }),
        }
    );

    if (isApiErrorResponse(bookmarkResponse)) {
        return false;
    }

    if (!chapter) {
        invalidateCacheKey(`bookmark-${mangaId}`);
        return bookmarkResponse.data.success;
    }

    return await updateBookmark(chapter);
}

export async function removeBookmark(mangaId: string) {
    const response = await fetchApi<{ success: boolean }>(
        "/api/v1/bookmarks/delete",
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: mangaId,
            }),
        }
    );
    if (isApiErrorResponse(response)) {
        return false;
    }

    if (response.data.success !== true) {
        return false;
    }

    invalidateCacheKey(`bookmark-${mangaId}`);
    return response.data.success;
}

export async function updateBookmark(chapter: Chapter): Promise<boolean> {
    const chapterDataBody: {
        chapterId: string;
        mangaId: string;
        manga: SmallBookmark;
    } = {
        chapterId: chapter.chapterId || "",
        mangaId: chapter.mangaId || "",
        manga: {
            mangaId: chapter.parentId,
            mangaName: chapter.title,
            mangaImage: chapter.malImage,
            latestChapter: chapter.number,
        },
    };

    const updateResponse = await fetchApi<{ success: boolean }>(
        `/api/v1/bookmarks/update`,
        {
            method: "POST",
            body: JSON.stringify(chapterDataBody),
        }
    );

    invalidateCacheKey(`last-read-${chapterDataBody.mangaId}`);
    if (isApiErrorResponse(updateResponse)) {
        return false;
    }

    return updateResponse.data.success;
}

export async function getLatestReadChapter(
    mangaId: string
): Promise<SmallBookmarkRecord | null> {
    const response = await fetchApi<SmallBookmarkRecord | null>(
        `/api/v1/bookmarks/last-read?id=${mangaId}`,
        { cacheKey: `last-read-${mangaId}` }
    );

    if (isApiErrorResponse(response)) {
        return null;
    }

    return response.data;
}

export function compareVersions(num1: number, num2: number): boolean {
    // Check if both values are integers
    if (Number.isInteger(num1) && Number.isInteger(num2)) {
        // Check if the first value is 1 larger than the second
        return num1 === num2 + 1;
    }

    // Check for ".5" decimal case, round down and compare
    const floorNum1 = Math.floor(num1);
    const floorNum2 = Math.floor(num2);

    if (num1 % 1 === 0.5 || num2 % 1 === 0.5) {
        // Compare after rounding down
        return floorNum1 === floorNum2;
    }

    // Check if the first value is 0.1 larger than the second
    const diff = Math.round((num1 - num2) * 10) / 10;
    if (diff === 0.1) {
        return true;
    }

    return false;
}

export function getButtonInfo(bookmark: Bookmark) {
    const mangaIdentifier = bookmark.mangaUrl.split("/").pop();
    let continueReading = bookmark.currentChapter.url;
    let continueReadingText = `Continue Reading - Chapter ${bookmark.currentChapter.number}`;
    let buttonColor = "bg-indigo-600 hover:bg-indigo-700";

    if (bookmark.latestChapter.number === bookmark.currentChapter.number) {
        continueReadingText = `Latest Chapter - Chapter ${bookmark.latestChapter.number}`;
        buttonColor = "bg-green-600 hover:bg-green-700";
        continueReading = bookmark.latestChapter.url;
    } else if (
        compareVersions(
            bookmark.latestChapter.number,
            bookmark.currentChapter.number
        )
    ) {
        continueReadingText = `New Chapter - Chapter ${bookmark.latestChapter.number}`;
        buttonColor = "bg-cyan-600 hover:bg-cyan-700";
        continueReading = bookmark.latestChapter.url;
    }

    return {
        mangaIdentifier,
        continueReading,
        continueReadingText,
        buttonColor,
    };
}
