import Toast from "../toast-wrapper";
import { syncMal } from "../auth/secondary-accounts/mal";
import { checkIfBookmarked, updateBookmark } from "./bookmarks";
import { getSetting } from "../settings";

type SyncHandler = (
    data: components["schemas"]["ChapterResponse"]
) => Promise<boolean>;
const services = ["Akari", "MAL"];

export async function syncAllServices(
    data: components["schemas"]["ChapterResponse"]
) {
    const syncHandlers: SyncHandler[] = [updateBookmark, syncMal];
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

    success = results.length > 0 && results[0]!.status === "fulfilled";
    const authorizedServices: string[] = [];
    const unAuthorizedServices: string[] = [];
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            const error = result.reason;
            if (error instanceof Response) {
                unAuthorizedServices.push(services[index]!);
            } else {
                console.error(`Failed to sync with handler:`, error);
            }
        } else {
            authorizedServices.push(services[index]!);
        }
    });
    if (unAuthorizedServices.length > 0) {
        const notToastServices = getSetting(
            "groupLoginToasts"
        ) as unknown as string[];
        const servicesToToast = unAuthorizedServices.filter(
            (service) => !notToastServices.includes(service)
        );
        if (servicesToToast.length > 0) {
            new Toast(
                `Not logged in to services: ${servicesToToast.join(", ")}`,
                "warning"
            );
        }
    }

    // Display a toast notification after all sync handlers are done
    if (success) {
        new Toast(`Bookmark updated successfully`, "success", {
            description: `${authorizedServices.join(", ")}`,
        });
    } else {
        new Toast("Failed to update bookmark.", "error");
    }

    if (authorizedServices.includes(services[0]!)) {
        return true;
    }
    return false;
}
