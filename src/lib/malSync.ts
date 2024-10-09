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
    const cachedManga = await db.getCache(db.hqMangaCache, identifier);
    if (cachedManga && cachedManga.score) {
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

        await db.updateCache(db.hqMangaCache, identifier, data);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
