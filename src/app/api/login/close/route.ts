import { NextResponse } from 'next/server';
import { browserInstance, pageInstance } from '../captcha/route';

// This function would be called to close the Puppeteer browser
export async function GET() {
  try {
    if (browserInstance) {
      await browserInstance.close();
      console.log('Puppeteer instance closed');
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'No Puppeteer instance to close' });
    }
  } catch (error) {
    console.error('Error closing Puppeteer:', error);
    return NextResponse.json({ success: false, message: 'Failed to close Puppeteer' });
  }
}
