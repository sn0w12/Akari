import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Manga {
  id: string;
  image: string | undefined;
  title: string;
  chapter: string;
  chapterUrl: string | undefined;
  description?: string;
  rating?: string;
  views?: string;
  date?: string;
  author?: string;
}

interface MetaData {
  totalStories: number;
  totalPages: number;
}

// Genre map to convert genre names to their respective IDs
const genreMap: { [key: string]: number } = {
  "Action": 2,
  "Adventure": 4,
  "Comedy": 6,
  "Cooking": 7,
  "Doujinshi": 9,
  "Drama": 10,
  "Erotica": 48,
  "Fantasy": 12,
  "Gender bender": 13,
  "Harem": 14,
  "Historical": 15,
  "Horror": 16,
  "Isekai": 45,
  "Josei": 17,
  "Manhua": 44,
  "Manhwa": 43,
  "Martial arts": 19,
  "Mature": 20,
  "Mecha": 21,
  "Medical": 22,
  "Mystery": 24,
  "One shot": 25,
  "Pornographic": 47,
  "Psychological": 26,
  "Romance": 27,
  "School life": 28,
  "Sci fi": 29,
  "Seinen": 30,
  "Shoujo": 31,
  "Shoujo ai": 32,
  "Shounen": 33,
  "Shounen ai": 34,
  "Slice of life": 35,
  "Smut": 36,
  "Sports": 37,
  "Supernatural": 38,
  "Tragedy": 39,
  "Webtoons": 40,
  "Yaoi": 41,
  "Yuri": 42
};

// Helper function to convert genre names to IDs using genreMap
const getGenreIds = (genres: (keyof typeof genreMap)[]): number[] => {
  return genres
    .map((genre) => genreMap[genre])
    .filter((id): id is number => id !== undefined); // Filter out undefined genres
};

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const includeGenresParam = searchParams.get('include')?.replaceAll('_', ' ').split(',') || [];
    const excludeGenresParam = searchParams.get('exclude')?.replaceAll('_', ' ').split(',') || [];
    const orderBy = searchParams.get('orderBy') || '';
    const page = searchParams.get('page') || '1';

    // Convert genre names to their corresponding IDs
    const includeGenres = getGenreIds(includeGenresParam);
    const excludeGenres = getGenreIds(excludeGenresParam);

    if (includeGenres.length === 0) {
      return NextResponse.json({ result: 'error', data: 'No valid genres included in search' }, { status: 400 });
    }

    // Construct include and exclude genre strings
    const includeGenresString = includeGenres.map(id => `_${id}_`).join('');
    const excludeGenresString = excludeGenres.map(id => `_${id}_`).join('');

    // Construct the search URL
    const searchUrl = `https://manganato.com/advanced_search?s=all&g_i=${includeGenresString}&g_e=${excludeGenresString}&page=${page}&orby=${orderBy}`;

    // Fetch the data from Manganato
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    let mangaList: Manga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $('.content-genres-item').each((index, element) => {
      const mangaElement = $(element);
      const imageUrl = mangaElement.find('img.img-loading').attr('src');
      const titleElement = mangaElement.find('h3 a.genres-item-name');
      const title = titleElement.text();
      const mangaUrl = titleElement.attr('href');
      const chapterElement = mangaElement.find('a.genres-item-chap');
      const latestChapter = chapterElement.text().replace('-', '.').match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0] || '';
      const chapterUrl = chapterElement.attr('href');
      const description = mangaElement.find('.genres-item-description').text().trim();
      const rating = mangaElement.find('em.genres-item-rate').text();
      const views = mangaElement.find('.genres-item-view').text();
      const date = mangaElement.find('.genres-item-time').text();
      const author = mangaElement.find('.genres-item-author').text();

      mangaList.push({
        id: mangaUrl?.split('/').pop() || '',
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

    const totalStories: number = mangaList.length;
    const lastPageElement = $('a.page-last');
    const totalPages: number = lastPageElement.length ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || '1', 10) : 1;


    // Return the HTML or processed data
    return new Response(
      JSON.stringify({
        mangaList,
        metaData: {
          totalStories,
          totalPages,
        } as MetaData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching genre search results:', error);
    return NextResponse.json(
      { result: 'error', data: error.message },
      { status: 500 }
    );
  }
}