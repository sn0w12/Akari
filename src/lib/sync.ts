import { Chapter, ReadingHistoryEntry } from "@/app/api/interfaces";
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
    console.log(data);

    const mangaId = data.mangaId;
    if (!mangaId) {
        console.error("Manga ID is not available in the data object.");
        return false;
    }

    const isBookmarked = await checkIfBookmarked(mangaId);
    if (!isBookmarked) {
        return null;
    }

    const results = await Promise.allSettled(
        syncHandlers.map((handler) => handler(data)),
    );

    const authorizedServices: string[] = [];
    const unAuthorizedServices: string[] = [];
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            const error = result.reason;
            if (error instanceof Response) {
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

    if (authorizedServices.includes(services[0])) {
        return true;
    }
    return false;
}

async function updateBookmark(data: Chapter) {
    const fallbackId = window.location.href.split("/").pop()?.split("?")[0];
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");

    const chapterDataBody: ReadingHistoryEntry = {
        chapterId: data.chapterId || "",
        chapterIdentifier: data.id || fallbackId || "",
        chapterTitle: data.chapter,
        mangaId: data.mangaId || "",
        mangaIdentifier: data.parentId,
        mangaTitle: data.title,
        image: data.images[0],
        readAt: new Date(),
        id: "",
        userId: auth.id,
    };

    const response = await fetch("/api/bookmarks/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chapter: chapterDataBody,
        }),
    });

    if (!response.ok) {
        throw response; // Throw the response object instead of creating a new Error
    }
}

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
