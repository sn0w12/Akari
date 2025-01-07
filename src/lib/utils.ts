import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import db from "@/lib/db";
import { genreMap } from "./consts";

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

export function parseDateString(dateStr: string | undefined): number {
    if (!dateStr) return 0;

    // Handle relative dates (e.g. "2 hours ago")
    if (dateStr.includes("ago")) {
        const num = parseInt(dateStr);
        if (dateStr.includes("hour")) {
            return Date.now() - num * 60 * 60 * 1000;
        } else if (dateStr.includes("day")) {
            return Date.now() - num * 24 * 60 * 60 * 1000;
        }
    }

    // Handle "Updated : Nov 08,2024 - 18:51" format
    if (dateStr.includes("Updated")) {
        const [, cleanDate, minutes] = dateStr.split(":"); // "Nov 08,2024 - 18:51"
        const [datePart, timePart] = cleanDate.split("-").map((s) => s.trim());
        const [month, day, year] = datePart.split(/[\s,]+/);
        const [hours] = timePart.split(":");

        const date = new Date(
            parseInt(year),
            getMonthNumber(month),
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
        );
        return date.getTime();
    }

    // Fallback to regular date parsing
    return Date.parse(dateStr);
}

export function getMonthNumber(month: string): number {
    const months: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };
    return months[month] || 0;
}

// Helper function to convert genre names to IDs using genreMap
export function getGenreIds(genres: (keyof typeof genreMap)[]): number[] {
    return genres
        .map((genre) => genreMap[genre])
        .filter((id): id is number => id !== undefined); // Filter out undefined genres
}
