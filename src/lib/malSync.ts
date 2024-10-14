import db from "@/lib/db";
import { MalSync } from "@/app/api/interfaces";
import { getSetting } from "./settings";

async function getHqData(malSyncData: MalSync) {
    let service;
    let id;
    if (malSyncData.malId) {
        service = "mal";
        id = malSyncData.malId;
    } else if (malSyncData.aniId) {
        service = "ani";
        id = malSyncData.aniId;
    } else return null;

    const response = await fetch(`/api/manga/${service}/${id}`);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    return data;
}

export async function fetchMalData(
    identifier: string,
    overWrite: boolean = false,
    retryCount: number = 3, // Maximum number of retries
    retryDelay: number = 2000, // Delay between retries in milliseconds (2 seconds)
) {
    const cachedManga = await db.getCache(db.hqMangaCache, identifier);
    if (cachedManga && cachedManga.score) {
        return cachedManga;
    }

    if (!getSetting("fetchMalImage") && !overWrite) {
        return null;
    }

    for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
            const malSyncResponse = await fetch(
                `https://api.malsync.moe/page/MangaNato/${encodeURIComponent(
                    identifier,
                )}`,
            );

            if (malSyncResponse.status === 429 && attempt < retryCount) {
                // If rate limited (429), wait and retry
                console.warn(`Rate limited, retrying in ${retryDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                continue; // Retry the request
            }

            if (!malSyncResponse.ok) {
                return null;
            }

            const malSyncResponseData: MalSync = await malSyncResponse.json();
            if (!malSyncResponseData) {
                return null;
            }

            const data = await getHqData(malSyncResponseData);
            if (!data) {
                return null;
            }

            if (malSyncResponseData.malUrl) {
                data["malUrl"] = malSyncResponseData.malUrl;
            }
            if (malSyncResponseData.aniUrl) {
                data["aniUrl"] = malSyncResponseData.aniUrl;
            }

            await db.updateCache(db.hqMangaCache, identifier, data);
            return data;
        } catch (error) {
            console.error(error);
            if (attempt === retryCount) {
                return null; // If retries are exhausted, return null
            }
        }
    }
}

export async function syncMal(id: string, num_chapters_read: string) {
    const maxRetries = 1; // Number of retries
    const retryDelay = 200000; // Delay before retrying (in milliseconds)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await fetch("/api/mal/me/mangalist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    manga_id: id,
                    num_chapters_read,
                }),
            });

            if (result.ok) {
                return await result.json(); // Return the response if successful
            }

            // Get the error message from the response, if available
            const errorDetails = await result.json().catch(() => ({}));
            const errorMessage =
                errorDetails.message || "No additional error message provided";

            // Log the error
            console.warn(`Attempt ${attempt + 1} failed: ${errorMessage}.`);

            // If it's the last attempt, return the error message
            if (attempt === maxRetries) {
                return {
                    success: false,
                    error: `Failed to update MAL: ${errorMessage} (Status: ${result.status})`,
                };
            }

            // Wait before retrying
            console.warn(`Retrying in ${retryDelay / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
        } catch (error) {
            // Return the error if an exception occurs
            return {
                success: false,
                error: `Unexpected error: ${(error as Error).message}`,
            };
        }
    }

    // This point should not be reached, but just in case:
    return {
        success: false,
        error: "Failed to update MAL after multiple attempts.",
    };
}
