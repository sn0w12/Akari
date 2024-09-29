import { NextResponse } from 'next/server';

const BOOKMARK_DELETE_URL = 'https://user.mngusr.com/bookmark_delete';

export async function POST(request) {
  try {
    const { user_data, bm_data } = await request.json();

    if (!user_data || !bm_data) {
      return NextResponse.json(
        { result: 'error', data: 'Missing user_data or bm_data' },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append('user_data', user_data);
    formData.append('bm_data', bm_data);

    const response = await fetch(BOOKMARK_DELETE_URL, {
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
    console.error('Error in /api/bookmarks/delete:', error);
    return NextResponse.json(
      { result: 'error', data: error.message },
      { status: 500 }
    );
  }
}
