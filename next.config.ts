import { NextConfig } from "next";

function generateCacheHeaders(
    time: number,
    staleWhileRevalidate?: number,
    staleIfError: number = 0,
    cacheTag: string = "page"
): Array<{ key: string; value: string }> {
    const swr = staleWhileRevalidate ?? Math.round(time * 2);
    const cacheControl = `public, max-age=${time}, stale-while-revalidate=${swr}, stale-if-error=${staleIfError}`;

    return [
        { key: "Cache-Control", value: cacheControl },
        { key: "CDN-Cache-Control", value: cacheControl },
        {
            key: "Cache-Tag",
            value: `${cacheTag}${
                process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1" ? "-preview" : ""
            }`,
        },
    ];
}

const config: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.akarimanga.dpdns.org",
                port: "",
                pathname: "/**",
            },
        ],
    },
    reactCompiler: true,
    experimental: {
        useCache: true,
        cssChunking: true,
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

export default config;
