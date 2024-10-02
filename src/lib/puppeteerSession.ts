import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  console.log('Running on Vercel platform');
} else {
  // running locally.
  console.log('Running locally');
}

export async function getPuppeteerSession() {
  if (!browserInstance || !pageInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    pageInstance = await browserInstance.newPage();
  }
  return { browserInstance, pageInstance };
}

export async function closePuppeteerSession() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    pageInstance = null;
  }
}
