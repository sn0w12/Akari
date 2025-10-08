import { Chapter } from "@/types/manga";
import Toast from "../toast-wrapper";
import { syncMal } from "./secondary-accounts/mal";
import { checkIfBookmarked, updateBookmark } from "./bookmarks";
import { getSetting } from "../settings";

type SyncHandler = (data: Chapter) => Promise<unknown>;
const services = ["MangaNato", "MAL"];

export async function syncAllServices(data: Chapter) {
    const syncHandlers: SyncHandler[] = [updateBookmark, syncBookmark];
    let success = true;

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
        syncHandlers.map((handler) => handler(data))
    );

    success = results[0].status === "fulfilled";
    const authorizedServices: string[] = [];
    const unAuthorizedServices: string[] = [];
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            const error = result.reason;
            if (error instanceof Response) {
                unAuthorizedServices.push(services[index]);
            } else {
                console.error(`Failed to sync with handler:`, error);
            }
        } else {
            authorizedServices.push(services[index]);
        }
    });
    if (unAuthorizedServices.length > 0) {
        if (getSetting("loginToasts")) {
            new Toast(
                `Not logged in to services: ${unAuthorizedServices.join(", ")}`,
                "warning"
            );
        }
    }

    // Display a toast notification after all sync handlers are done
    if (success) {
        new Toast(`Bookmark updated successfully`, "success", {
            Description: `${unAuthorizedServices.join(", ")}`,
        });
    } else {
        new Toast("Failed to update bookmark.", "error");
    }

    if (authorizedServices.includes(services[0])) {
        return true;
    }
    return false;
}

async function syncBookmark(data: Chapter) {
    if (!data.malId) return;

    const regex = /Chapter\s(\d+)/;
    const match = data.chapter.match(regex);
    const chapterNumber = match ? match[1] : null;
    if (!chapterNumber) return;

    await syncMal(data.malId, chapterNumber, false);
}
