/**
 * Generates cache control headers for different caching levels.
 * @param time - The base time in seconds for caching
 * @param staleWhileRevalidate - Time in seconds to use stale content while revalidating (defaults to time/2)
 * @param staleIfError - Time in seconds to use stale content when errors occur (defaults to time)
 * @returns An object containing cache control headers
 */
export function generateCacheHeaders(
    time: number,
    staleWhileRevalidate?: number,
    staleIfError?: number,
) {
    let cacheControl = `public, max-age=${time}`;

    const staleWhileRevalidateTime =
        staleWhileRevalidate !== undefined
            ? staleWhileRevalidate
            : Math.round(time * 2);
    cacheControl += `, stale-while-revalidate=${staleWhileRevalidateTime}`;

    const staleIfErrorTime = staleIfError !== undefined ? staleIfError : time;
    cacheControl += `, stale-if-error=${staleIfErrorTime}`;

    return {
        "Cache-Control": cacheControl,
        "CDN-Cache-Control": cacheControl,
        "Vercel-CDN-Cache-Control": `public, s-maxage=${time}, stale-while-revalidate=${staleWhileRevalidateTime}, stale-if-error=${staleIfErrorTime}`,
    };
}

export function generateClientCacheHeaders(time: number) {
    return {
        "Cache-Control": `private, max-age=${time}`,
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
        headers: { "cache-control": `max-age=${time}` },
        next: { revalidate: revalidate },
    };
}
