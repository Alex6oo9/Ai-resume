import path from 'path';
import { extractTextFromPDF } from '../pdfParser';

const FIXTURES_DIR = path.join(__dirname, '../../../__tests__/fixtures');

describe('PDF Parser Service', () => {
  it('should extract text from a valid PDF', async () => {
    const filePath = path.join(FIXTURES_DIR, 'sample-resume.pdf');
    const text = await extractTextFromPDF(filePath);

    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain('John Doe');
    expect(text).toContain('Software Engineer');
  });

  it('should throw on a corrupt/invalid file', async () => {
    const filePath = path.join(FIXTURES_DIR, 'corrupt.pdf');

    await expect(extractTextFromPDF(filePath)).rejects.toThrow();
  });

  it('should return empty or minimal text for an empty PDF', async () => {
    const filePath = path.join(FIXTURES_DIR, 'empty.pdf');
    const text = await extractTextFromPDF(filePath);

    // An empty PDF has no meaningful text
    const cleaned = text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
    expect(cleaned.length).toBe(0);
  });

  it('should throw when file does not exist', async () => {
    await expect(extractTextFromPDF('/nonexistent/file.pdf')).rejects.toThrow();
  });
});
