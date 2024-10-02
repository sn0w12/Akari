import type { Browser, Page } from 'puppeteer-core';

let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

let chrome = {};
let puppeteer: { launch: (arg0: { headless: boolean; args: string[]; }) => Browser | PromiseLike<Browser | null> | null; };

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  // running locally.
  puppeteer = require('puppeteer');
}

export async function getPuppeteerSession() {
  if (!browserInstance || !pageInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    if (browserInstance) {
      pageInstance = await browserInstance.newPage();
    }
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
