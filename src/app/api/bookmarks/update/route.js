import { NextResponse } from 'next/server';

const BOOKMARK_UPDATE_URL = 'https://user.mngusr.com/bookmark_update';

export async function POST(request) {
  try {
    const { user_data, story_data, chapter_data } = await request.json();

    if (!user_data || !story_data || !chapter_data) {
      return NextResponse.json(
        { result: 'error', data: 'Missing user_data, story_data, or chapter_data' },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append('user_data', user_data);
    formData.append('story_data', story_data);
    formData.append('chapter_data', chapter_data);

    const response = await fetch(BOOKMARK_UPDATE_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.text();
    const result = JSON.parse(data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/bookmarks/update:', error);
    return NextResponse.json(
      { result: 'error', data: error.message },
      { status: 500 }
    );
  }
}
