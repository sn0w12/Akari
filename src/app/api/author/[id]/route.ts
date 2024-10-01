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

export async function GET(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = params.id;
    const orderBy = searchParams.get('orderBy') || '';
    const page = searchParams.get('page') || '1';

    if (!authorId) {
        return NextResponse.json({ result: 'error', data: 'No valid author included in search' }, { status: 400 });
    }

    // Construct the search URL
    const searchUrl = `https://manganato.com/author/story/${authorId}?page=${page}&orby=${orderBy}`;

    // Fetch the data from Manganato
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    let mangaList: Manga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
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
    console.error('Error fetching author search results:', error);
    return NextResponse.json(
      { result: 'error', data: error.message },
      { status: 500 }
    );
  }
}
