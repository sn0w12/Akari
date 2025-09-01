import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import db from "@/lib/db";

const isDev = process.env.NODE_ENV === "development";

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

export function isSignedIn() {
    return !!localStorage.getItem("accountName");
}

interface PerformanceMetrics {
    [key: string]: number;
}

export const performanceMetrics: PerformanceMetrics = {};
const startTimes: { [key: string]: number } = {};

export function time(label: string) {
    startTimes[label] = performance.now();
    if (isDev) {
        console.time(label);
    }
}

export function timeEnd(label: string) {
    const endTime = performance.now();
    const startTime = startTimes[label];
    if (startTime) {
        performanceMetrics[label] = Number((endTime - startTime).toFixed(2));
        delete startTimes[label];
    }

    if (isDev) {
        console.timeEnd(label);
    }
}

export function cleanText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
}

export function clearPerformanceMetrics() {
    Object.keys(performanceMetrics).forEach((key) => {
        delete performanceMetrics[key];
    });
}

export function imageUrl(url: string, baseUrl?: string): string {
    if (url.includes("myanimelist")) {
        return url;
    }

    return `${baseUrl || ""}/api/image-proxy?imageUrl=${encodeURIComponent(url)}`;
}
