import { inDevelopment } from "@/config";

export interface PerformanceMetrics {
    [key: string]: number;
}

export const performanceMetrics: PerformanceMetrics = {};
const startTimes: { [key: string]: number } = {};

export function time(label: string) {
    startTimes[label] = performance.now();
    if (inDevelopment) {
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

    if (inDevelopment) {
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
