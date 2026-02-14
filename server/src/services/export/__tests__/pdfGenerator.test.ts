jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));

import puppeteer from 'puppeteer';
import { generatePdf } from '../pdfGenerator';

const mockPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;

describe('generatePdf', () => {
  const mockPdf = Buffer.from('fake-pdf-content');
  let mockPage: any;
  let mockBrowser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPage = {
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(mockPdf),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);
  });

  it('returns a Buffer from HTML input', async () => {
    const html = '<html><body><h1>Resume</h1></body></html>';
    const result = await generatePdf(html);

    expect(result).toBeInstanceOf(Buffer);
    expect(result).toEqual(mockPdf);
  });

  it('launches Puppeteer in headless mode', async () => {
    await generatePdf('<html></html>');

    expect(mockPuppeteer.launch).toHaveBeenCalledWith(
      expect.objectContaining({ headless: true })
    );
  });

  it('sets HTML content on the page', async () => {
    const html = '<html><body>Test</body></html>';
    await generatePdf(html);

    expect(mockPage.setContent).toHaveBeenCalledWith(html, {
      waitUntil: 'networkidle0',
    });
  });

  it('generates PDF with correct margins', async () => {
    await generatePdf('<html></html>');

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in',
        },
      })
    );
  });

  it('closes the browser after generation', async () => {
    await generatePdf('<html></html>');

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('closes the browser even on error', async () => {
    mockPage.pdf.mockRejectedValue(new Error('PDF generation failed'));

    await expect(generatePdf('<html></html>')).rejects.toThrow(
      'PDF generation failed'
    );
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('throws when Puppeteer launch fails', async () => {
    mockPuppeteer.launch.mockRejectedValue(
      new Error('Chrome not found')
    );

    await expect(generatePdf('<html></html>')).rejects.toThrow(
      'Chrome not found'
    );
  });
});
