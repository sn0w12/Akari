import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const apiEndpoint = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(searchParams.get('title') || '')}&limit=1`;

  try {
    const request = await axios.get(apiEndpoint);
    const manga = request.data.data[0]; // Retrieve the first result

    const response = {
        titles: manga.titles,
        imageUrl: manga.images.jpg.large_image_url,
        url: manga.url,
        score: manga.scored,
    }

    return new NextResponse(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error searching for manga:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
