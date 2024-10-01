import db from "@/lib/db";

export async function getHqImage(identifier: string, origImage: string) {
    const mangaCache = await db.getCache(db.hqMangaCache, identifier);
    if (mangaCache && mangaCache?.imageUrl) {
        return mangaCache.imageUrl;
    }
    return origImage;
}