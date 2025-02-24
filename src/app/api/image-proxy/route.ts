import { generateCacheHeaders } from "@/lib/cache";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");

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
                Referer: "https://www.nelomanga.com/",
                "Sec-Fetch-Dest": "image",
                "Sec-Fetch-Mode": "no-cors",
                "Sec-Fetch-Site": "cross-site",
            },
        });

        const imageBuffer = Buffer.from(response.data);
        return new NextResponse(imageBuffer, {
            headers: {
                "Content-Type": "image/webp",
                ...generateCacheHeaders(7 * 24 * 60 * 60),
            },
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 500 },
        );
    }
}
