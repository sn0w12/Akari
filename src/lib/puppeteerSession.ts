import type { Browser, Page } from 'puppeteer-core';

let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

let chromium: { args: string[]; executablePath: any; };
let puppeteer: { launch: (arg0: { headless: boolean; args: string[]; executablePath?: string; }) => Browser | PromiseLike<Browser | null> | null; };

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  chromium = require('@sparticuz/chromium');
  puppeteer = require('puppeteer-core');
} else {
  // running locally.
  puppeteer = require('puppeteer');
}

export async function getPuppeteerSession() {
  if (!browserInstance || !pageInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL
        ? await chromium.executablePath
        : undefined,
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
