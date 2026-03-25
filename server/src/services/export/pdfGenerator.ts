import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar';

export async function generatePdf(
  html: string,
  opts: { margins?: boolean } = {}
): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === 'production';

  const executablePath = isProduction
    ? await chromium.executablePath(CHROMIUM_URL)
    : (process.env.PUPPETEER_EXECUTABLE_PATH ?? await chromium.executablePath(CHROMIUM_URL));

  const browser = await puppeteer.launch({
    args: isProduction
      ? chromium.args
      : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    defaultViewport: null,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin:
        opts.margins === false
          ? { top: '0', right: '0', bottom: '0', left: '0' }
          : { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
