import { NextResponse } from 'next/server';

const BOOKMARK_SERVER_URL_1 = 'https://user.mngusr.com/bookmark_get_list_full';

// Function to fetch bookmarks from the external API
async function fetchBookmarks(user_data: string, page: number, url: string) {
  const data = new URLSearchParams();
  data.append('user_data', user_data);
  data.append('bm_page', page.toString());
  data.append('bm_source', 'manganato');
  data.append('out_type', 'json');

  const response = await fetch(url, {
    method: 'POST',
    body: data.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Named export for GET requests (you can also use POST if needed)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_data = searchParams.get('user_data');

  if (!user_data) {
    return NextResponse.json(
      { message: 'user_data is required' },
      { status: 400 }
    );
  }

  const url = BOOKMARK_SERVER_URL_1;

  const readableStream = new ReadableStream({
    async start(controller) {
      let currentPage = 1;

      try {
        while (true) {
          const result = await fetchBookmarks(user_data, currentPage, url);

          if (result.result !== 'ok') {
            controller.error(new Error('Error fetching bookmarks'));
            return;
          }

          const bookmarks = result.data.map((bookmark: any) => ({
            ...bookmark,
            page: currentPage,
          }));

          for (const bookmark of bookmarks) {
            const data = `data: ${JSON.stringify(bookmark)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }

          const finalPage = result.bm_page_total;

          if (currentPage >= finalPage) {
            const stopEvent = `event: stop\ndata: \n\n`;
            controller.enqueue(new TextEncoder().encode(stopEvent));
            controller.close();
            break;
          }

          currentPage++;
        }
      } catch (error: any) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

