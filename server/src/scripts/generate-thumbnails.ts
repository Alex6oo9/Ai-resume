import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const TEMPLATE_IDS = [
  'modern',
  'modern_yellow_split',
  'dark_ribbon_modern',
  'modern_minimalist_block',
  'editorial_earth_tone',
  'ats_clean',
  'ats_lined',
] as const;

const OUTPUT_DIR = path.resolve(__dirname, '../../../client/public/thumbnails');
const BASE_URL = 'http://localhost:5173';

async function generateThumbnails() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const templateId of TEMPLATE_IDS) {
      console.log(`Generating thumbnail for: ${templateId}`);

      const page = await browser.newPage();

      await page.setViewport({
        width: 816,
        height: 1056,
        deviceScaleFactor: 2,
      });

      await page.goto(`${BASE_URL}/thumbnail-preview?template=${templateId}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      await page.waitForSelector('[data-thumbnail-ready="true"]', {
        timeout: 15000,
      });

      const outputPath = path.join(OUTPUT_DIR, `${templateId}.png`);
      await page.screenshot({
        path: outputPath,
        fullPage: false,
        clip: { x: 0, y: 0, width: 816, height: 1056 },
      });

      console.log(`  Saved: ${outputPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log('\nAll thumbnails generated successfully!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

generateThumbnails().catch((err) => {
  console.error('Failed to generate thumbnails:', err);
  process.exit(1);
});
