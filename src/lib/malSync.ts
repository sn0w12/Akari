import db from "@/lib/db";
import { MalSync } from "@/app/api/interfaces";

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

export async function fetchMalData(identifier: string) {
    let cachedManga = await db.getCache(db.hqMangaCache, identifier);
    if (cachedManga) {
        return cachedManga;
    }

    try {
        const malSyncResponse = await fetch(
            `https://api.malsync.moe/page/MangaNato/${encodeURIComponent(
                identifier,
            )}`,
        );
        if (!malSyncResponse.ok) {
            return null;
        }
        const malSyncResponseData: MalSync = await malSyncResponse.json();
        const data = await getHqData(malSyncResponseData);
        data["malUrl"] = malSyncResponseData.malUrl;
        data["aniUrl"] = malSyncResponseData.aniUrl;

        cachedManga = data;
        await db.setCache(db.hqMangaCache, identifier, cachedManga);
        return cachedManga;
    } catch (error) {
        console.error(error);
        return null;
    }
}
