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
        unoptimized: true,
    },
    experimental: {
        reactCompiler: true,
    },
    async headers() {
        return [
            {
                source: "/",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=60, stale-while-revalidate=30",
                    },
                ],
            },
            {
                source: "/popular",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=1200, stale-while-revalidate=120",
                    },
                ],
            },
            {
                source: "/genre/:id",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=300, stale-while-revalidate=60",
                    },
                ],
            },
            {
                source: "/author/:id",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=1200, stale-while-revalidate=120",
                    },
                ],
            },
            {
                source: "/manga/:id",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=300, stale-while-revalidate=60",
                    },
                ],
            },
            {
                source: "/manga/:id/:subid",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=300, stale-while-revalidate=60",
                    },
                ],
            },
        ];
    },
};
