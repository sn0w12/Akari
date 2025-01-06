/**
 * Generates cache control headers for different caching levels.
 * @param time - The base time in seconds for caching
 * @returns An object containing cache control headers
 */
export function generateCacheHeaders(time: number) {
    return {
        "Cache-Control": `public, s-maxage=${time}`,
        "CDN-Cache-Control": `public, s-maxage=${time * 60}`,
        "Vercel-CDN-Cache-Control": `public, s-maxage=${time * 60 * 60}`,
    };
}
