import { NextResponse } from 'next/server';
import { browserInstance, pageInstance } from '../captcha/route';

export async function POST(request: Request) {
  try {
    const { username, password, captcha } = await request.json();

    if (!pageInstance || !browserInstance) {
      throw new Error('No active Puppeteer session');
    }

    // Step 1: Fill the login form fields
    await pageInstance.type('input[name="username"]', username);
    await pageInstance.type('input[name="password"]', password);
    await pageInstance.type('input[name="captchar"]', captcha);

    // Step 2: Submit the form and wait for all redirects to complete
    await Promise.all([
      pageInstance.click('#submit_login'), // Replace with the correct selector for the login button
      pageInstance.waitForNavigation({ waitUntil: 'networkidle2' }), // Wait for navigation after login
    ]);

    // Step 3: Follow redirects if there are any (track multiple redirects)
    let isRedirecting = true;
    let redirectCount = 0;
    while (isRedirecting && redirectCount < 5) {
      try {
        // Wait for the next possible navigation (redirect)
        await pageInstance.waitForNavigation({ waitUntil: 'networkidle2', timeout: 1000 });
        redirectCount++;
      } catch (error) {
        // If navigation times out, assume there are no more redirects
        isRedirecting = false;
      }
    }

    // Step 4: Extract cookies after all redirects are done
    const cookies = await pageInstance.cookies();

    // Step 5: Close the Puppeteer browser
    await browserInstance.close();

    // Step 6: Return cookies to the client
    return NextResponse.json({ success: true, cookies });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
