import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('search') || 1;

    // Construct the URL with the page number
    const url = `https://manganato.com/genre-all/${page}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let mangaList = [];
    let popular = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $('.content-genres-item').each((index, element) => {
      const mangaElement = $(element);
      const imageUrl = mangaElement.find('img.img-loading').attr('src');
      const titleElement = mangaElement.find('h3 a.genres-item-name');
      const title = titleElement.text();
      const mangaUrl = titleElement.attr('href');
      const chapterElement = mangaElement.find('a.genres-item-chap');
      const latestChapter = chapterElement.text().replace('-', '.').match(/[Cc]hapter\s(\d+)(\.\d+)?/)[0];
      const chapterUrl = chapterElement.attr('href');
      const description = mangaElement.find('.genres-item-description').text().trim();
      const rating = mangaElement.find('em.genres-item-rate').text();
      const views = mangaElement.find('.genres-item-view').text();
      const date = mangaElement.find('.genres-item-time').text();
      const author = mangaElement.find('.genres-item-author').text();

      mangaList.push({
        id: mangaUrl.split('/').pop(),
        image: imageUrl,
        title: title,
        chapter: latestChapter,
        chapterUrl: chapterUrl,
        description: description,
        rating: rating,
        views: views,
        date: date,
        author: author,
      });
    });

    const totalStories = mangaList.length;
    const lastPageElement = $('a.page-last');
    const totalPages = lastPageElement.length ? parseInt(lastPageElement.text().match(/\d+/)[0], 10) : 1;

    $('.item').each((index, element) => {
      const mangaElement = $(element);
      const imageUrl = mangaElement.find('img.img-loading').attr('src');
      const titleElement = mangaElement.find('h3 a.text-nowrap');
      const title = titleElement.text();
      const mangaUrl = titleElement.attr('href');
      const chapterElement = mangaElement.find('a.text-nowrap');
      const latestChapter = chapterElement.text().replace(title, '').replace('-', '.').match(/[Cc]hapter\s(\d+)(\.\d+)?/)[0];
      const chapterUrl = chapterElement.attr('href');

      popular.push({
        id: mangaUrl.split('/').pop(),
        image: imageUrl,
        title: title,
        chapter: latestChapter,
        chapterUrl: chapterUrl,
      });
    });

    return new Response(
      JSON.stringify({
        mangaList,
        popular,
        metaData: {
          totalStories,
          totalPages,
        },
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
