import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

const standardFontDataUrl =
  path.join(
    path.dirname(require.resolve('pdfjs-dist/package.json')),
    'standard_fonts'
  ) + '/';

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    standardFontDataUrl,
    useSystemFonts: false,
  });

  const result = await parser.getText();

  // Strip the page footer markers like "-- 1 of 3 --"
  const text = result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
  return text;
}
