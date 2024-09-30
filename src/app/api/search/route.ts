import axios from 'axios';
import * as cheerio from 'cheerio';
import Fuse from 'fuse.js';

interface Manga {
  id: string;
  image: string | undefined;
  title: string;
  chapter: string;
  chapterUrl: string | undefined;
  rating: string;
  author: string;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const query: string = searchParams.get('search') || ''; // Get search query
    const page: string = searchParams.get('page') || '1';

    // Construct the URL with the page number
    const url = `https://manganato.com/search/story/${query}?page=${page}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let mangaList: Manga[] = [];

    // Scrape the manga list from the website
    $('.search-story-item').each((index, element) => {
      const mangaElement = $(element);
      const imageUrl = mangaElement.find('img.img-loading').attr('src');
      const titleElement = mangaElement.find('h3 a.item-title');
      const title = titleElement.text();
      const mangaUrl = titleElement.attr('href');
      const chapterElement = mangaElement.find('a.item-chapter').first();
      const latestChapter = chapterElement.text();
      const chapterUrl = chapterElement.attr('href');
      const rating = mangaElement.find('em.item-rate').text();
      const author = mangaElement.find('.item-author').text();

      let views: string | undefined;
      let date: string | undefined;

      $('.item-time').each((i, timeElement) => {
        if (i === 0) views = $(timeElement).text();
        if (i === 1) date = $(timeElement).text();
      });

      mangaList.push({
        id: mangaUrl?.split('/').pop() || '',
        image: imageUrl,
        title: title,
        chapter: latestChapter,
        chapterUrl: chapterUrl,
        rating: rating,
        author: author,
      });
    });

    // Use Fuse.js to search the manga list
    const fuse = new Fuse(mangaList, {
      keys: ['title'],
      threshold: 0.6,
    });

    const searchResults = fuse.search(query.replace('_', ' '));
    mangaList = searchResults.map(result => result.item); // Map Fuse results back to original data

    return new Response(
      JSON.stringify({
        mangaList,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch latest manga' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
