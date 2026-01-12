import { SECONDARY_ACCOUNTS } from "../auth/secondary-accounts";
import { checkIfBookmarked, updateBookmark } from "./bookmarks";
import { SyncHandler } from "../auth/secondary-accounts";

const services = ["Akari", ...SECONDARY_ACCOUNTS.map((acc) => acc.name)];

export async function syncAllServices(
    data: components["schemas"]["ChapterResponse"],
) {
    const syncHandlers: SyncHandler[] = [
        updateBookmark,
        ...SECONDARY_ACCOUNTS.map((acc) => acc.sync),
    ];

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
        if (result.status === "fulfilled") {
            if (result.value === false) {
                unAuthorizedServices.push(services[index]!);
            } else {
                authorizedServices.push(services[index]!);
            }
        } else {
            // Handle rejected promises (e.g., treat as unauthorized or log error)
            console.error(`Sync failed for ${services[index]}:`, result.reason);
            unAuthorizedServices.push(services[index]!);
        }
    });

    if (authorizedServices.includes(services[0]!)) {
        return true;
    }
    return false;
}
