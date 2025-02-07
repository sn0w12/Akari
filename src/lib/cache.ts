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
    };
}

export function generateFetchCacheOptions(
    time: number,
    revalidate: number = -1,
) {
    if (revalidate === -1) {
        revalidate = time / 2;
    }

    return {
        headers: { "cache-control": `maxage=${time}` },
        next: { revalidate: revalidate },
    };
}
