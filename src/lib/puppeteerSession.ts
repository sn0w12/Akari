// puppeteerSession.ts
import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

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
