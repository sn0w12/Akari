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
};

export default config;
