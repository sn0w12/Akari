function generateCacheHeaders(
    time: number,
    staleWhileRevalidate?: number,
    staleIfError: number = 0
): Array<{ key: string; value: string }> {
    const swr = staleWhileRevalidate ?? Math.round(time * 2);
    const cacheControl = `public, max-age=${time}, stale-while-revalidate=${swr}, stale-if-error=${staleIfError}`;

    return [
        { key: "Cache-Control", value: cacheControl },
        { key: "CDN-Cache-Control", value: cacheControl },
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
                pathname: "/api/v1/image-proxy",
            },
        ],
        unoptimized: false,
    },
    experimental: {
        reactCompiler: true,
        useCache: true,
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
