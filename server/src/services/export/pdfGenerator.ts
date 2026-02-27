import puppeteer from 'puppeteer';

export async function generatePdf(
  html: string,
  opts: { margins?: boolean } = {}
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
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
