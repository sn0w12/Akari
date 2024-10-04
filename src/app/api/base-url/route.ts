import { NextResponse } from "next/server";

export default function GET() {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";
    return new NextResponse(JSON.stringify({ baseUrl }));
}
