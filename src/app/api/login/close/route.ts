import { NextResponse } from 'next/server';
import { closePuppeteerSession } from '@/lib/puppeteerSession';

// This function would be called to close the Puppeteer browser
export async function GET() {
  try {
    await closePuppeteerSession();
    console.log('Puppeteer instance closed');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing Puppeteer:', error);
    return NextResponse.json({ success: false, message: 'Failed to close Puppeteer' });
  }
}
