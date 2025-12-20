import { NextConfig } from "next";

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
