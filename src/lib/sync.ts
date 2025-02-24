import { Chapter } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import { fetchMalData, syncMal } from "@/lib/malSync";
import db from "./db";
import { checkIfBookmarked } from "./bookmarks";
import { getSetting } from "./settings";

type SyncHandler = (data: Chapter) => Promise<void>;
const services = ["MangaNato", "MAL"];

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

    let authorizedServices: string[] = [];
    let unAuthorizedServices: string[] = [];
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            const error = result.reason;
            if (error instanceof Response && error.status === 401) {
                unAuthorizedServices.push(services[index]);
            } else {
                console.error(`Failed to sync with handler:`, error);
                success = false;
            }
        } else {
            authorizedServices.push(services[index]);
        }
    });
    if (unAuthorizedServices.length > 0) {
        if (getSetting("loginToasts")) {
            new Toast(
                `Not logged in to services: ${unAuthorizedServices.join(", ")}`,
                "warning",
            );
        }
    }

    // Display a toast notification after all sync handlers are done
    if (success) {
        db.updateCache(db.mangaCache, data.parentId, {
            last_read: window.location.href.split("/").pop() || "",
        });
        db.updateCache(db.hqMangaCache, data.parentId, {
            up_to_date: data.parentId == data.nextChapter,
        });

        new Toast(
            `Bookmark updated successfully on: ${authorizedServices.join(", ")}`,
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
    const mangaId = data.mangaId;
    const chapterId = data.chapterId;

    if (!mangaId || !chapterId) {
        return;
    }

    const response = await fetch("/api/bookmarks/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            manga_id: mangaId,
            chapter_id: chapterId,
        }),
    });

    if (!response.ok) {
        throw response; // Throw the response object instead of creating a new Error
    }
}

// Example sync handler for external site (MAL)
async function syncBookmark(data: Chapter) {
    const regex = /Chapter\s(\d+)/;
    const match = data.chapter.match(regex);
    const chapterNumber = match ? match[1] : null;
    if (!chapterNumber) return;

    const malData = await fetchMalData(data.parentId, true);
    const malId = malData?.malUrl.split("/").pop();
    if (!malData || !malData.malUrl || !malId) return;

    await syncMal(malId, chapterNumber, false);
}
