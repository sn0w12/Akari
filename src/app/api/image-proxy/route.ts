import { generateCacheHeaders } from "@/lib/cache";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");
    const cache = searchParams.get("cache");

    if (!imageUrl) {
        return NextResponse.json(
            { error: "Missing imageUrl parameter" },
            { status: 400 },
        );
    }

    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
                Accept: "image/avif,image/jxl,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Sec-GPC": "1",
                Connection: "keep-alive",
                Referer: `https://${process.env.NEXT_MANGA_URL}/`,
                "Sec-Fetch-Dest": "image",
                "Sec-Fetch-Mode": "no-cors",
                "Sec-Fetch-Site": "cross-site",
            },
            timeout: 500,
        });

        const imageBuffer = Buffer.from(response.data);
        const headers = {
            "Content-Type": "image/jpeg",
        };

        if (cache === "false") {
            // Explicitly prevent caching
            Object.assign(headers, {
                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                "Surrogate-Control": "no-store",
            });
        } else {
            // Apply normal cache headers
            Object.assign(headers, generateCacheHeaders(2592000));
        }

        return new NextResponse(imageBuffer, { headers });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 500 },
        );
    }
}
