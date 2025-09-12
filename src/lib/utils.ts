import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const isDev = process.env.NODE_ENV === "development";
const isPreview = process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
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

export function robots() {
    if (isDev || isPreview) {
        return {
            index: false,
            follow: false,
        };
    } else {
        return {
            index: true,
            follow: true,
        };
    }
}
