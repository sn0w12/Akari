import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import * as cheerio from 'cheerio';

export async function GET(req, { params }) {
  const id = params.id;
  const { searchParams } = new URL(req.url);
  const userData = {
    user_version: "2.3",
    user_name: searchParams.get('user_name'),
    user_image: "https://user.manganelo.com/avt.png",
    user_data: searchParams.get('user_data'),
  };
  console.log(JSON.stringify(userData));

  try {
    const jar = new CookieJar();

    // Function to fetch and parse manga details from a given URL
    const fetchMangaDetails = async (baseUrl) => {
      const url = `${baseUrl}/${id}`;

      // Set the cookie in the jar for the current URL
      if (searchParams.get('user_name') && searchParams.get('user_data')) {
        jar.setCookieSync(`user_acc=${JSON.stringify(userData)}`, url);
      }

      const instance = axios.create({
        httpAgent: new HttpCookieAgent({ cookies: { jar } }),
        httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
      });

      // Make the request without the 'cookie' header
      const response = await instance.get(url, {
        headers: {
          'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
          'Accept-Language': req.headers.get('accept-language') || 'en-US,en;q=0.9',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const imageUrl = $('.story-info-left .info-image img').attr('src');
      const name = $('.story-info-right h1').text();
      const alternativeTitles = $('.variations-tableInfo .info-alternative').parent().find('h2').text().trim();
      const authors = [];
      $('.variations-tableInfo .info-author').closest('tr').find('a').each((index, element) => {
        authors.push($(element).text().trim());
      });
      const status = $('.variations-tableInfo .info-status').closest('tr').find('td.table-value').text().trim();
      const description = $('.panel-story-info-description').clone().children().remove().end().text().replace(`Come visit MangaNato.com sometime to read the latest chapter of A Cool Older Lady That Makes Me Crazy. If you have any question about this manga, Please don't hesitate to contact us or translate team. Hope you enjoy it.`, '').trim();
      const score = parseFloat($('em[property="v:average"]').text().trim());

      // Extract Genres
      const genres = [];
      $('.variations-tableInfo .info-genres').closest('tr').find('a').each((index, element) => {
        genres.push($(element).text().trim());
      });

      // Extract updated time and view count
      const updated = $('.story-info-right-extent .info-time').parent().parent().find('.stre-value').text().trim();
      const view = $('.story-info-right-extent .info-view').parent().parent().find('.stre-value').text().trim();

      // Extract Chapters
      const chapterList = [];
      $('.panel-story-chapter-list .row-content-chapter li').each((index, element) => {
        const chapterElement = $(element);
        const chapterName = chapterElement.find('.chapter-name').text().trim();
        const chapterUrl = chapterElement.find('.chapter-name').attr('href');
        const chapterView = chapterElement.find('.chapter-view').text().trim();
        const chapterTime = chapterElement.find('.chapter-time').attr('title');

        chapterList.push({
          id: chapterUrl.split('/').pop(),
          path: chapterUrl,
          name: chapterName,
          view: chapterView,
          createdAt: chapterTime,
        });
      });

      const scriptTags = $('.body-site script');

      let glbStoryData = null;
      let mangaId = null;

      // Loop through script tags to find the one containing glb_story_data
      scriptTags.each((i, elem) => {
        const scriptContent = $(elem).html();

        if (scriptContent) {
          const storyDataMatch = scriptContent.match(/glb_story_data\s*=\s*'([^']+)'/);
          const postidMatch = scriptContent.match(/\$postid\s*=\s*'(\d+)'/);

          if (postidMatch) {
            mangaId = postidMatch[1];
          }
          if (storyDataMatch) {
            glbStoryData = storyDataMatch[1];
          }
        }
      });

      // Construct the response object
      const mangaDetails = {
        mangaId,
        storyData: glbStoryData,
        imageUrl,
        name,
        authors,
        status,
        updated,
        view,
        score,
        genres,
        description,
        chapterList,
      };

      return mangaDetails;
    };

    // First attempt with chapmanganato.to
    let mangaDetails = await fetchMangaDetails('https://chapmanganato.to');
    let oldMangaDetails = mangaDetails;

    // If glbStoryData is not found, retry with manganato.com
    if (!mangaDetails.storyData) {
      console.log('glbStoryData not found on chapmanganato.to, retrying with manganato.com');
      mangaDetails = await fetchMangaDetails('https://manganato.com');
    }

    const hasMoreInfo = (oldDetails, newDetails) => {
      for (let key in oldDetails) {
        if (oldDetails[key] && !newDetails[key]) {
          return true;
        }
      }
      return false;
    };

    if (hasMoreInfo(oldMangaDetails, mangaDetails)) {
      mangaDetails = oldMangaDetails;
    }

    // Return the manga details as JSON
    return new Response(JSON.stringify(mangaDetails), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching manga details:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch manga details' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
