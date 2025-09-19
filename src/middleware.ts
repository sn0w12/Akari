import { NextRequest, NextResponse } from "next/server";

const SKIP_LOGGING_EXACT = ["/api/image-proxy", "/favicon.ico", "/_next/image"];
const SKIP_LOGGING_PREFIXES = ["/_next/static/"];

export function middleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname;

    if (
        SKIP_LOGGING_EXACT.includes(pathname) ||
        SKIP_LOGGING_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ) {
        return NextResponse.next();
    }

    const isPrefetch = request.nextUrl.searchParams.has("_prefetch");

    console.log(
        `[${new Date().toISOString().replace("T", " ").slice(0, 19)} | ${request.method} | ${isPrefetch ? "PRE" : "NAV"}] ${decodeURIComponent(pathname)}`,
    );

    return NextResponse.next();
}
