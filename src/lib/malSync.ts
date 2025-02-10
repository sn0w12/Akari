import db from "@/lib/db";
import { HqMangaCacheItem, MalSync } from "@/app/api/interfaces";
import { getSetting } from "./settings";
import { akariUrls } from "./consts";

async function getMalData(identifier: number) {
    const apiEndpoint = `https://api.jikan.moe/v4/manga/${identifier}`;

    try {
        const request = await fetch(apiEndpoint);
        const data = await request.json();
        const manga = data.data;

        const response = {
            titles: manga.titles,
            imageUrl: manga.images.webp.large_image_url,
            smallImageUrl: manga.images.webp.small_image_url,
            url: manga.url,
            score: manga.scored / 2,
            description: manga.synopsis,
        } as HqMangaCacheItem;

        return response;
    } catch (error) {
        console.error("Error searching for manga:", error);
        return null;
    }
}

async function getAniData(identifier: number) {
    const query = `
        query ExampleQuery($mediaId: Int!) {
          Media(id: $mediaId) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              extraLarge
              medium
            }
            genres
            averageScore
            siteUrl
          }
        }
      `;

    const variables = {
        mediaId: identifier,
    };
    try {
        const request = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const data = await request.json();
        const manga = data.data.Media;

        const titles = [
            { type: "Romaji", title: manga.title.romaji },
            { type: "English", title: manga.title.english },
            { type: "Native", title: manga.title.native },
        ].filter((title) => title.title !== null);

        const response = {
            titles: titles,
            imageUrl: manga.coverImage.extraLarge,
            smallImageUrl: manga.coverImage.medium,
            url: manga.siteUrl,
            score: manga.averageScore / 20,
            description: manga.description,
        } as HqMangaCacheItem;

        return response;
    } catch (error) {
        console.error("Error searching for manga:", error);
        return null;
    }
}

async function getHqData(malSyncData: MalSync) {
    let data = null;

    if (malSyncData.malId) {
        data = await getMalData(malSyncData.malId);
    } else if (malSyncData.aniId) {
        data = await getAniData(malSyncData.aniId);
    } else return null;

    return data;
}

export async function updateMalSync(
    identifier: string,
    data: HqMangaCacheItem,
) {
    if (!akariUrls.includes(window.location.hostname)) {
        console.log("Skipping MAL Sync update - unauthorized hostname");
        return null;
    }

    try {
        const response = await fetch("/api/manga/malsync/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                identifier,
                mangaData: data,
            }),
        });

        if (!response.ok) {
            console.error(`API error: ${response.status}`);
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating MAL Sync:", error);
    }
    return null;
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
            updateMalSync(identifier, data);
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
