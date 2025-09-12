/**
 * Generates cache control headers in Next.js-ready format
 * @param {number} time - Max age in seconds
 * @param {number} staleWhileRevalidate - Optional time for stale-while-revalidate
 * @param {number} staleIfError - Optional time for stale-if-error
 * @returns {Array} - Array of header objects ready for Next.js config
 */
function generateCacheHeaders(
    time,
    staleWhileRevalidate = undefined,
    staleIfError = undefined,
) {
    let cacheControl = `public, max-age=${time}`;

    const staleWhileRevalidateTime =
        staleWhileRevalidate !== undefined
            ? staleWhileRevalidate
            : Math.round(time * 2);
    cacheControl += `, stale-while-revalidate=${staleWhileRevalidateTime}`;

    const staleIfErrorTime = staleIfError !== undefined ? staleIfError : time;
    cacheControl += `, stale-if-error=${staleIfErrorTime}`;

    const vercelCacheControl = `public, s-maxage=${time}, stale-while-revalidate=${staleWhileRevalidateTime}, stale-if-error=${staleIfErrorTime}`;

    return [
        { key: "Cache-Control", value: cacheControl },
        { key: "CDN-Cache-Control", value: cacheControl },
        { key: "Vercel-CDN-Cache-Control", value: vercelCacheControl },
    ];
}

module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avt.mkklcdnv6temp.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "mn2.mkklcdnv6temp.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "s4.anilist.co",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
                port: "",
                pathname: "/**",
            },
        ],
        localPatterns: [
            {
                pathname: "/api/image-proxy",
            },
        ],
        unoptimized: false,
    },
    experimental: {
        reactCompiler: true,
        useCache: true,
        cacheComponents: true,
    },
    async headers() {
        return [
            {
                source: "/",
                headers: generateCacheHeaders(60, 360), // 1 minute, 6 minutes
            },
            {
                source: "/popular",
                headers: generateCacheHeaders(86400, 604800), // 1 day, 7 days
            },
            {
                source: "/bookmarks",
                headers: generateCacheHeaders(86400, 604800), // 1 day, 7 days
            },
            {
                source: "/genre/:path", // Genres
                headers: generateCacheHeaders(180, 900), // 3 minutes, 15 minutes
            },
            {
                source: "/author/:path", // Authors
                headers: generateCacheHeaders(3600), // 1 hour
            },
            {
                source: "/manga/:path*", // Chapters
                headers: generateCacheHeaders(3600, 604800), // 1 hour, 7 days
            },
            {
                source: "/manga/:path", // Manga
                headers: generateCacheHeaders(300, 900), // 5 minutes, 15 minutes
            },
        ];
    },
};
