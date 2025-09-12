import db from "@/lib/db";
import { HqMangaCacheItem, MalSync, MalData } from "@/app/api/interfaces";
import { getSetting } from "./settings";

async function getMalData(identifier: number) {
    const apiEndpoint = `https://api.jikan.moe/v4/manga/${identifier}`;

    try {
        const request = await fetch(apiEndpoint);
        const data = await request.json();
        const manga = data.data;

        const response: HqMangaCacheItem = {
            id: "",
            image: manga.images.webp.large_image_url,
            score: typeof manga.scored === "number" ? manga.scored : null,
            description: manga.synopsis,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            mal_id: manga.mal_id,
            ani_id: null,
            type: manga.type,
        };

        return response;
    } catch (error) {
        console.error("Error searching for manga:", error);
        return null;
    }
}

async function getHqData(malSyncData: MalData) {
    let data = null;

    if (malSyncData.mal_id) {
        data = await getMalData(malSyncData.mal_id);
    } else return null;

    return data;
}

export async function fetchMalData(
    identifier: string,
    overWrite: boolean = false,
    retryCount: number = 3, // Maximum number of retries
    retryDelay: number = 2000, // Delay between retries in milliseconds (2 seconds)
    useCache: boolean = true,
) {
    if (useCache) {
        const cachedManga = await db.getCache(db.hqMangaCache, identifier);
        if (cachedManga && cachedManga.score) {
            return cachedManga;
        }
    }

    if (!getSetting("fetchMalImage") && !overWrite) {
        return null;
    }

    for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
            const malSyncResponse = await fetch(
                `/api/mal/${encodeURIComponent(identifier)}`,
            );

            if (malSyncResponse.status === 429 && attempt < retryCount) {
                // If rate limited (429), wait and retry
                console.warn(`Rate limited, retrying in ${retryDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                continue; // Retry the request
            }

            if (!malSyncResponse.ok) {
                console.error(`Access forbidden to MAL Sync API:`);
                return null;
            }

            const malSyncResponseJson: MalSync = await malSyncResponse.json();
            if (!malSyncResponseJson.success) {
                return null;
            }
            const malSyncResponseData = malSyncResponseJson.data;

            const data = await getHqData(malSyncResponseData);
            if (!data) {
                return null;
            }

            if (data.description != null) {
                data.description = data.description
                    .replace("[Written by MAL Rewrite]", "")
                    .trim();
            }

            if (useCache) {
                await db.updateCache(db.hqMangaCache, identifier, data);
            }
            return data;
        } catch (error) {
            console.error(error);
            if (attempt === retryCount) {
                return null; // If retries are exhausted, return null
            }
        }
    }
}

export async function syncMal(
    id: number,
    num_chapters_read: string,
    retry: boolean = true,
) {
    const maxRetries = 1;
    const retryDelay = 200000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch("/api/mal/me/mangalist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    manga_id: id,
                    num_chapters_read,
                }),
            });

            if (!response.ok) {
                throw response; // Throw the response object directly
            }

            return await response.json();
        } catch (error) {
            if (attempt < maxRetries && retry) {
                console.warn(`Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                continue;
            }
            throw error; // Throw the error to be handled by syncAllServices
        }
    }
}
