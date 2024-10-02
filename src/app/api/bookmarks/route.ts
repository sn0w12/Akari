import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BOOKMARK_SERVER_URL_1 = 'https://user.mngusr.com/bookmark_get_list_full';

// Function to fetch bookmarks for a single page from the external API
async function fetchBookmarks(user_data: string, page: number, url: string) {
  // Function to fetch based on output type
  async function fetchData(out_type: string) {
    const data = new URLSearchParams();
    data.append('user_data', user_data);
    data.append('bm_page', page.toString());
    data.append('bm_source', 'manganato');
    data.append('out_type', out_type);  // Dynamic output type (json or html)

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

    return out_type === 'json' ? response.json() : response.text();
  }

  // Fetch both JSON and HTML in parallel
  const [jsonResponse, htmlResponse] = await Promise.all([
    fetchData('json'),  // Fetch JSON response
    fetchData('html'),  // Fetch HTML response
  ]);

  return { jsonResponse, htmlResponse };
}

// Named export for GET requests (fetch a specific page of bookmarks)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_data = searchParams.get('user_data');
  const page = parseInt(searchParams.get('page') || '1', 10); // Default to page 1 if not provided

  if (!user_data) {
    return NextResponse.json({ message: 'user_data is required' }, { status: 400 });
  }

  const url = BOOKMARK_SERVER_URL_1;

  try {
    const { jsonResponse: jsonResult, htmlResponse: htmlResult } = await fetchBookmarks(user_data, page, url);

    if (jsonResult.result !== 'ok') {
      return NextResponse.json(
        { message: 'Error fetching bookmarks', details: jsonResult.data },
        { status: 500 }
      );
    }

    // Load the static HTML into cheerio
    const html = JSON.parse(htmlResult);
    //console.log(html.data)
    const $ = cheerio.load(html.data);

    // Iterate through the JSON data
    jsonResult.data.forEach((item: { noteid: string; bm_data?: string }) => {
      const noteId = item.noteid;
      const className = `bm-it-${noteId}`;

      // Find the element in the HTML by class name using cheerio
      const element = $(`.${className}`);

      if (element.length > 0) {
        // Find the `a` tag with class 'btn-remove' inside the element
        const removeButton = element.find('.btn-remove');

        if (removeButton.length > 0) {
          // Get the `onclick` attribute value
          const onClickAttr = removeButton.attr('onclick');

          if (onClickAttr) {
            // Use regex to extract the first argument from fun_bookmark_delete
            const match = onClickAttr.match(/fun_bookmark_delete\('([^']+)'/);

            if (match && match[1]) {
              item['bm_data'] = match[1];
            } else {
              console.log(`Could not extract string from onclick for noteid ${noteId}`);
            }
          } else {
            console.log(`No onclick attribute found for noteid ${noteId}`);
          }
        } else {
          console.log(`Remove button not found for noteid ${noteId}`);
        }
      } else {
        console.log(`Element not found for noteid ${noteId}`);
      }
    });

    // Return the fetched data and current page information
    return NextResponse.json({
      page,
      totalPages: jsonResult.bm_page_total,
      bookmarks: jsonResult.data,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Error fetching bookmarks', error: (error as Error).message }, { status: 500 });
  }
}
