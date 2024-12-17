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
        console.error(`Failed to fetch data for ${service} ID ${id}`);
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
                `https://api.malsync.moe/page/MangaNato/${encodeURIComponent(identifier)}`,
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
    id: string,
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
