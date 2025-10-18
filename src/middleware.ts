import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { inDevelopment } from "./config";

const SKIP_LOGGING_EXACT = [
    "/api/v1/image-proxy",
    "/favicon.ico",
    "/_next/image",
];
const SKIP_LOGGING_PREFIXES = ["/_next/static/"];

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    darkGray: "\x1b[90m",
    white: "\x1b[37m",
};

const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
        case "GET":
            return colors.green;
        case "POST":
            return colors.yellow;
        case "PUT":
            return colors.blue;
        case "DELETE":
            return colors.red;
        case "PATCH":
            return colors.magenta;
        case "HEAD":
            return colors.darkGray;
        case "OPTIONS":
            return colors.darkGray;
        default:
            return colors.white;
    }
};

const routeTransformations = [
    {
        key: "/manga/[id]",
        condition: (x: string) =>
            x.startsWith("/manga/") && x.split("/").length === 3,
    },
    {
        key: "/manga/[id]/[subId]",
        condition: (x: string) =>
            x.startsWith("/manga/") && x.includes("/chapter-"),
    },
    {
        key: "/genre/[id]",
        condition: (x: string) =>
            x.startsWith("/genre/") && x.split("/").length === 3,
    },
    {
        key: "/author/[id]",
        condition: (x: string) =>
            x.startsWith("/author/") && x.split("/").length === 3,
    },
];

function getTransformedKey(x: string): string | null {
    for (const { key, condition } of routeTransformations) {
        if (condition(x)) return key;
    }
    return null;
}

export function middleware(request: NextRequest): NextResponse {
    if (inDevelopment) {
        return NextResponse.next();
    }

    const pathname = request.nextUrl.pathname;

    if (
        SKIP_LOGGING_EXACT.includes(pathname) ||
        SKIP_LOGGING_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ) {
        return NextResponse.next();
    }

    setTimeout(() => {
        const userAgent = request.headers.get("user-agent");
        const { browser, os } = UAParser(userAgent || "");
        const isPrefetch = request.nextUrl.searchParams.has("_prefetch");

        const timestamp = new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);
        const method = `${getMethodColor(request.method)}${request.method}`;
        const requestType = pathname.startsWith("/api")
            ? `${colors.magenta}API`
            : isPrefetch
            ? `${colors.yellow}PRE`
            : `${colors.blue}NAV`;

        const route = getTransformedKey(pathname);
        console.log(
            `[${timestamp} | ${method}${colors.reset} | ${requestType}${
                colors.reset
            }] ${route ? `${route} | ` : ""}${decodeURIComponent(pathname)} | ${
                browser.name || "Unknown"
            } | ${os.name || "Unknown"}`
        );
    }, 0);

    return NextResponse.next();
}
