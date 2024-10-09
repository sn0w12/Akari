import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import db from "@/lib/db";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function getHqImage(identifier: string, origImage: string) {
    const mangaCache = await db.getCache(db.hqMangaCache, identifier);
    if (mangaCache && mangaCache?.imageUrl) {
        return mangaCache.imageUrl;
    }
    return origImage;
}

export function numberArraysEqual(
    a: number[] | null,
    b: string | number[] | null,
) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    return a.every((val: number, idx: number) => val === b[idx]);
}
