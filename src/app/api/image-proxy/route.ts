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
                Referer: "https://manganato.com",
                "User-Agent": "Mozilla/5.0",
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
