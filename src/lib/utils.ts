import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import db from "@/lib/db";
import { headers } from "next/headers";

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

export function getErrorMessage(status: number | undefined): string {
    switch (status) {
        case 400:
            return "The request was invalid. Please try refreshing the page.";
        case 401:
            return "You need to be logged in to access this content.";
        case 403:
            return "Access to this content is restricted. You may need to log in or use a different server.";
        case 404:
            return "The page couldn't be found. It may have been removed or relocated.";
        case 429:
            return "Too many requests. Please wait a bit before trying again.";
        case 500:
            return "The server is having issues. Please try again later.";
        case 503:
            return "The service is temporarily unavailable. Please try again in a few minutes.";
        default:
            return status
                ? `An error occurred (Status: ${status}). Please try refreshing or using a different server.`
                : "An unknown error occurred. Please check your internet connection and try again.";
    }
}

export async function getUserHeaders() {
    let headersList: { [key: string]: string } = {};
    try {
        const headerEntries = Array.from((await headers()).entries());
        headersList = headerEntries.reduce(
            (acc: { [key: string]: string }, [key, value]) => {
                // Skip problematic headers
                if (
                    key.toLowerCase() === "connection" ||
                    key.toLowerCase() === "transfer-encoding" ||
                    key.toLowerCase() === "keep-alive"
                ) {
                    return acc;
                }
                acc[key] = value;
                return acc;
            },
            {} as { [key: string]: string },
        );
    } catch (headerError) {
        console.log("Could not get headers:", headerError);
    }
    return headersList;
}
