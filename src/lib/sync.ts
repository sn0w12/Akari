import { Chapter } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import { fetchMalData, syncMal } from "@/lib/malSync";
import db from "./db";
import { checkIfBookmarked } from "./bookmarks";

type SyncHandler = (data: Chapter) => Promise<void>;

export async function syncAllServices(data: Chapter) {
    const syncHandlers: SyncHandler[] = [updateBookmark, syncBookmark];
    let success = true;

    const cachedManga = await db.getCache(db.mangaCache, data.parentId);
    let mangaId;
    if (!cachedManga) {
        const response: Response = await fetch(`/api/manga/${data.parentId}`);
        const responseData = await response.json();
        mangaId = responseData.mangaId;

        db.updateCache(db.mangaCache, data.parentId, { id: mangaId });
    } else {
        mangaId = cachedManga.id;
    }

    const isBookmarked = await checkIfBookmarked(mangaId);
    if (!isBookmarked) {
        return;
    }

    const results = await Promise.allSettled(
        syncHandlers.map((handler) => handler(data)),
    );

    results.forEach((result) => {
        if (result.status === "rejected") {
            console.error(`Failed to sync with handler:`, result.reason);
            success = false; // If any handler fails, mark success as false
        }
    });

    // Display a toast notification after all sync handlers are done
    if (success) {
        db.updateCache(db.mangaCache, data.parentId, {
            last_read: window.location.href.split("/").pop() || "",
        });
        db.updateCache(db.hqMangaCache, data.parentId, {
            up_to_date: data.parentId == data.nextChapter,
        });

        new Toast(
            "Bookmark updated successfully across all services!",
            "success",
            {
                autoClose: 1000,
            },
        );
    } else {
        new Toast("Failed to update bookmark on some services.", "error");
    }
}

// Example sync handler for your website
async function updateBookmark(data: Chapter) {
    const story_data = data.storyData;
    const chapter_data = data.chapterData;
    if (!chapter_data || !story_data) return;

    const response = await fetch("/api/bookmarks/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ story_data, chapter_data }),
    });

    if (!response.ok) {
        throw new Error("Failed to update bookmark");
    }
}

// Example sync handler for external site (MAL)
async function syncBookmark(data: Chapter) {
    const regex = /Chapter\s(\d+)/;
    const match = data.chapter.match(regex);
    const chapterNumber = match ? match[1] : null;
    if (!chapterNumber) return;

    const malData = await fetchMalData(data.parentId, true);
    if (!malData || !malData.malUrl) return;

    await syncMal(malData.malUrl.split("/").pop(), chapterNumber);
}
