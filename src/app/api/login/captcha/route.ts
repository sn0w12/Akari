import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

// In-memory storage for Puppeteer browser instances (session)
export let browserInstance: Browser | null = null;
export let pageInstance: Page | null = null;

export async function GET() {
  try {
    if (!browserInstance || !pageInstance) {
      // Step 1: Launch Puppeteer browser
      browserInstance = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      pageInstance = await browserInstance.newPage();
    }

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
