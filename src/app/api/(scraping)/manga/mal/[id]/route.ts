import { generateCacheHeaders } from "@/lib/cache";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const apiEndpoint = `https://api.jikan.moe/v4/manga/${params.id}`;

    try {
        const request = await axios.get(apiEndpoint);
        const manga = request.data.data; // Retrieve the first result

        const response = {
            titles: manga.titles,
            imageUrl: manga.images.webp.large_image_url,
            smallImageUrl: manga.images.webp.small_image_url,
            url: manga.url,
            score: manga.scored / 2,
            description: manga.synopsis,
        };

        return new NextResponse(JSON.stringify(response), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
            },
        });
    } catch (error) {
        console.error("Error searching for manga:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
