import axios from "axios";
import { generateCacheHeaders } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");
    const cache = searchParams.get("cache");

    if (!imageUrl) {
        return NextResponse.json(
            { error: "Missing imageUrl parameter" },
            { status: 400 }
        );
    }

    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                referer: `https://${process.env.NEXT_MANGA_URL}/`,
                Accept: "image/avif,image/jxl,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
            },
            timeout: 10000,
        });

        const contentType = response.headers["content-type"];
        if (!contentType || !contentType.startsWith("image/")) {
            return NextResponse.json(
                { error: "The requested resource is not a valid image" },
                { status: 400 }
            );
        }

        const imageBuffer = Buffer.from(response.data);
        const headers = {
            "Content-Type": contentType,
        };

        if (cache === "false") {
            Object.assign(headers, {
                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                "Surrogate-Control": "no-store",
            });
        } else {
            Object.assign(headers, generateCacheHeaders(2592000));
        }

        return new NextResponse(imageBuffer, { headers });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 500 }
        );
    }
}
