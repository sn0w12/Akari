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
        imageSizes: [48, 96, 128, 240, 320, 400, 640, 1080, 1920],
        qualities: [20, 40, 60, 80, 100],
    },
    reactCompiler: true,
    experimental: {
        useCache: true,
        inlineCss: true,
    },
};

export default config;
