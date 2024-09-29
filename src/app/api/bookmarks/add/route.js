import { NextResponse } from 'next/server';

const BOOKMARK_ADD_URL = 'https://user.mngusr.com/bookmark_add';

export async function POST(request) {
  try {
    const { user_data, story_data } = await request.json();

    if (!user_data || !story_data) {
      return NextResponse.json(
        { result: 'error', data: 'Missing user_data or story_data' },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append('user_data', user_data);
    formData.append('story_data', story_data);

    const response = await fetch(BOOKMARK_ADD_URL, {
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
    console.error('Error in /api/bookmarks/add:', error);
    return NextResponse.json(
      { result: 'error', data: error.message },
      { status: 500 }
    );
  }
}
