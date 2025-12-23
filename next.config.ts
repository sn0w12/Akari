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
        loader: "custom",
        loaderFile: "./scripts/image-loader.ts",
    },
    reactCompiler: true,
    experimental: {
        useCache: true,
        inlineCss: true,
    },
};

export default config;
