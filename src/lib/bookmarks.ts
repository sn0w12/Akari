import { Bookmark, MangaCacheItem } from "@/app/api/interfaces";

export function compareVersions(str1: string, str2: string): boolean {
    // Replace "-" with "." in both strings
    const num1 = parseFloat(str1.replace(/-/g, "."));
    const num2 = parseFloat(str2.replace(/-/g, "."));

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
    const mangaIdentifier = bookmark.link_story.split("/").pop();
    let continueReading = bookmark.link_chapter_now;
    let continueReadingText = `Continue Reading - Chapter ${bookmark.chapter_numbernow}`;
    let buttonColor = "bg-indigo-600 hover:bg-indigo-700";

    if (bookmark.up_to_date && bookmark.up_to_date === true) {
        if (bookmark.chapterlastnumber === bookmark.chapter_numbernow) {
            continueReadingText = `Latest Chapter - Chapter ${bookmark.chapterlastnumber}`;
            buttonColor = "bg-green-600 hover:bg-green-700";
            continueReading = bookmark.link_chapter_last;
        } else if (
            compareVersions(
                bookmark.chapterlastnumber,
                bookmark.chapter_numbernow,
            )
        ) {
            continueReadingText = `New Chapter - Chapter ${bookmark.chapterlastnumber}`;
            buttonColor = "bg-cyan-600 hover:bg-cyan-700";
            continueReading = bookmark.link_chapter_last;
        }
    }

    return {
        mangaIdentifier,
        continueReading,
        continueReadingText,
        buttonColor,
    };
}

export async function checkIfBookmarked(
    mangaId: string,
): Promise<Record<string, boolean> | boolean> {
    const response = await fetch(`/api/bookmarks/isbookmarked?id=${mangaId}`);
    const data = await response.json();
    return data.isBookmarked;
}

export async function getAllBookmarks(batchSize: number = 10) {
    const firstPageResult = await fetch(`/api/bookmarks?page=1`);

    const firstPageData = await firstPageResult.json();
    const totalPages = firstPageData.totalPages;
    const allBookmarks: Bookmark[] = [...firstPageData.bookmarks];

    // Create batches of page numbers
    const remainingPages = Array.from(
        { length: totalPages - 1 },
        (_, i) => i + 2,
    );
    const batches = [];

    for (let i = 0; i < remainingPages.length; i += batchSize) {
        batches.push(remainingPages.slice(i, i + batchSize));
    }

    // Fetch batches in parallel
    for (const batch of batches) {
        const batchPromises = batch.map((page) =>
            fetch(`/api/bookmarks?page=${page}`)
                .then((res) => res.json())
                .then((data) => data.bookmarks),
        );

        const batchResults = await Promise.all(batchPromises);
        allBookmarks.push(...batchResults.flat());
    }

    return allBookmarks;
}

export function bookmarksToCacheItems(bookmarks: Bookmark[]): MangaCacheItem[] {
    return bookmarks.map((bookmark: Bookmark) => ({
        name: bookmark.note_story_name,
        link: bookmark.link_story,
        last_chapter: bookmark.link_chapter_last.split("/").pop() || "",
        last_read: bookmark.link_chapter_now.split("/").pop() || "",
        bm_data: bookmark.bm_data,
        id: bookmark.storyid,
        image: bookmark.image,
        last_update: bookmark.chapterlastdateupdate,
    }));
}

export const fetchNotification = async () => {
    // Check local storage first
    const cached = localStorage.getItem("notification");
    const timestamp = localStorage.getItem("notificationTimestamp");
    const now = Date.now();

    // If we have cached data and it's less than 24 hours old
    if (
        cached &&
        timestamp &&
        now - parseInt(timestamp) < 24 * 60 * 60 * 1000
    ) {
        return cached;
    }

    try {
        const res = await fetch(`/api/bookmarks/notification`);

        if (!res.ok) {
            localStorage.removeItem("notification");
            localStorage.removeItem("notificationTimestamp");
            if (res.status === 401) {
                localStorage.removeItem("auth");
                localStorage.removeItem("accountName");
            }
            return "";
        }

        const data = await res.json();
        localStorage.setItem("notification", data);
        localStorage.setItem("notificationTimestamp", now.toString());
        return data;
    } catch (error) {
        console.error("Error fetching notification:", error);
        return "";
    }
};
