import axios from "axios";
import { NextResponse } from "next/server";
import sizeOf from "image-size";

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

        const dimensions = sizeOf(response.data);

        return NextResponse.json({
            width: dimensions.width,
            height: dimensions.height,
        });
    } catch (error) {
        console.error("Error fetching image dimensions:", error);
        return NextResponse.json(
            { error: "Failed to get image dimensions" },
            { status: 500 },
        );
    }
}
