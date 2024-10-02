import { NextResponse } from 'next/server';
import { getPuppeteerSession } from '@/lib/puppeteerSession';

export async function GET() {
  try {
    const { pageInstance } = await getPuppeteerSession();

    // Step 2: Go to the login page
    await pageInstance.goto('https://user.manganelo.com/login?l=manganato&re_l=login', {
      waitUntil: 'networkidle2',
    });

    // Step 3: Extract CAPTCHA image URL
    const captchaUrl = await pageInstance.evaluate(() => {
      const captchaImg = document.querySelector('.captchar img');
      return captchaImg ? (captchaImg as HTMLImageElement).src : null;
    });

    if (!captchaUrl) {
      throw new Error('CAPTCHA not found');
    }

    // Step 4: Return CAPTCHA URL
    return NextResponse.json({ captchaUrl });
  } catch (error) {
    console.error('Error fetching CAPTCHA:', error);
    return NextResponse.json({ error: 'Failed to fetch CAPTCHA' }, { status: 500 });
  }
}
