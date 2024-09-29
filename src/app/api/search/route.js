import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('search') || 1;

    // Construct the URL with the page number
    const url = `https://manganato.com/search/story/${page}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let mangaList = [];

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
      let views;
      let date;
      $('.item-time').each((index, element) => {
        if (index === 0) views = $(element).text();
        if (index === 1) date = $(element).text();
      });
      const author = mangaElement.find('.item-author').text();

      mangaList.push({
        id: mangaUrl.split('/').pop(),
        image: imageUrl,
        title: title,
        chapter: latestChapter,
        chapterUrl: chapterUrl,
        rating: rating,
        author: author,
      });
    });

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
