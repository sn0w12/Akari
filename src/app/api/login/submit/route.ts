import { NextResponse } from 'next/server';
import { getPuppeteerSession, closePuppeteerSession } from '@/lib/puppeteerSession';

export async function POST(request: Request) {
  try {
    const { username, password, captcha } = await request.json();
    const { pageInstance } = await getPuppeteerSession();

    if (!pageInstance) {
      throw new Error('No active Puppeteer session');
    }

    // Wait for input fields to be available
    await pageInstance.waitForSelector('input[name="username"]');
    await pageInstance.type('input[name="username"]', username);

    await pageInstance.waitForSelector('input[name="password"]');
    await pageInstance.type('input[name="password"]', password);

    await pageInstance.waitForSelector('input[name="captchar"]');
    await pageInstance.type('input[name="captchar"]', captcha);

    // Submit the form and wait for navigation
    await Promise.all([
      pageInstance.click('#submit_login'),
      pageInstance.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Handle redirects
    let isRedirecting = true;
    let redirectCount = 0;
    while (isRedirecting && redirectCount < 5) {
      try {
        // Wait for the next possible navigation (redirect)
        await pageInstance.waitForNavigation({ waitUntil: 'networkidle2', timeout: 1000 });
        redirectCount++;
      } catch (error) {
        // If navigation times out, assume no more redirects
        console.log(error);
        isRedirecting = false;
      }
    }

    // Extract cookies after all redirects
    const cookies = await pageInstance.cookies();
    await closePuppeteerSession();

    // Return cookies to the client
    return NextResponse.json({ success: true, cookies });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

