/**
 * Generates cache control headers for different caching levels.
 * @param time - The base time in seconds for caching
 * @returns An object containing cache control headers
 */
export function generateCacheHeaders(time: number) {
    return {
        "Cache-Control": `maxage=${time}`,
        "CDN-Cache-Control": `max-age=${time}`,
        "Vercel-CDN-Cache-Control": `s-maxage=${time}`,
    };
}

export function generateClientCacheHeaders(time: number) {
    return {
        "Cache-Control": `private, maxage=${time}`,
        "CDN-Cache-Control": "no-store, no-cache",
        "Vercel-CDN-Cache-Control": "no-store, no-cache",
    };
}
