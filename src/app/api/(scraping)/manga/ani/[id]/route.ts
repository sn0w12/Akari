import { generateCacheHeaders } from "@/lib/cache";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const query = `
    query ExampleQuery($mediaId: Int!) {
      Media(id: $mediaId) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          extraLarge
          medium
        }
        genres
        averageScore
        siteUrl
      }
    }
  `;

    const variables = {
        mediaId: params.id,
    };
    try {
        const request = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const data = await request.json();
        const manga = data.data.Media;

        const titles = [
            { type: "Romaji", title: manga.title.romaji },
            { type: "English", title: manga.title.english },
            { type: "Native", title: manga.title.native },
        ].filter((title) => title.title !== null);

        const response = {
            titles: titles,
            imageUrl: manga.coverImage.extraLarge,
            smallImageUrl: manga.coverImage.medium,
            url: manga.siteUrl,
            score: manga.averageScore / 20,
            description: manga.description,
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
