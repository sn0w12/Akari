import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { username, password, captcha, ciSessionCookie } = await request.json();
    const cookieString = `${ciSessionCookie.key}=${ciSessionCookie.value}`;

    if (!username || !password || !captcha || !cookieString) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jar = new CookieJar();
    await jar.setCookie(cookieString, 'https://user.manganelo.com/');
    const client = wrapper(axios.create({ jar }));

    const loginResponse = await client.post(
      'https://user.manganelo.com/login_handle',
      new URLSearchParams({
        user: username,
        pass: password,
        captchar: captcha,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'Referer': 'https://user.manganelo.com/login?l=manganato&re_l=login',
          'Origin': 'https://user.manganelo.com',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en,sv;q=0.9',
          'X-Requested-With': 'XMLHttpRequest',
          'Sec-CH-UA': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
        },
        withCredentials: true,
      }
    );

    if (loginResponse.data != 'okie') {
      return NextResponse.json({ error: 'Invalid credentials or CAPTCHA' }, { status: 400 });
    }

    const redirectResponse = await client.get('https://user.manganelo.com/?l=manganato&re_l=login', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Referer': 'https://user.manganelo.com/login?l=manganato&re_l=login',
        'Origin': 'https://user.manganelo.com',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en,sv;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-CH-UA': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
      }
    });

    const $ = cheerio.load(redirectResponse.data);
    const scriptSrc = $('script[src^="https://manganelo.com/login_al"]').attr('src');
    if (!scriptSrc) {
      return NextResponse.json({ error: 'Error processing login' }, { status: 500 });
    }

    const userAccResponse = await client.get(scriptSrc, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Referer': 'https://user.manganelo.com/login?l=manganato&re_l=login',
        'Origin': 'https://user.manganelo.com',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en,sv;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-CH-UA': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
      }
    });

    const setCookieHeader = userAccResponse.headers['set-cookie'];
    if (!setCookieHeader) {
      return NextResponse.json({ error: 'Error processing login' }, { status: 500 });
    }

    // Find the 'user_acc' cookie
    const userAccCookie = setCookieHeader.find(cookie => cookie.startsWith('user_acc='));
    if (userAccCookie) {
      const userAccValue = userAccCookie.split(';')[0].split('=')[1];
      const decodedUserAcc = decodeURIComponent(userAccValue);

      return NextResponse.json({ userAccCookie: decodedUserAcc });
    } else {
      return NextResponse.json({ error: 'Invalid credentials or CAPTCHA' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error processing login', details: (error as Error).message }, { status: 500 });
  }
}
