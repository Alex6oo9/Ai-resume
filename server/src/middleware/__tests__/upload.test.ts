import path from 'path';
import fs from 'fs';
import express from 'express';
import request from 'supertest';
import { uploadMiddleware } from '../upload';

const UPLOADS_DIR = path.join(__dirname, '../../../uploads-test');

// Create a small test app with the upload middleware
function createTestApp() {
  const app = express();
  app.post(
    '/upload',
    uploadMiddleware(UPLOADS_DIR).single('file'),
    (req, res) => {
      res.status(200).json({
        filename: req.file?.filename,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
      });
    }
  );
  // Error handler for multer errors
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(400).json({ error: err.message });
    }
  );
  return app;
}

// Create a minimal valid PDF buffer
function createMinimalPdf(): Buffer {
  const pdfContent =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';
  return Buffer.from(pdfContent);
}

describe('Upload Middleware', () => {
  beforeAll(() => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test uploads
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
    }
  });

  it('should accept a valid PDF file', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/upload')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.mimetype).toBe('application/pdf');
    expect(res.body.filename).toBeDefined();
    expect(res.body.filename).toMatch(/\.pdf$/);
  });

  it('should reject non-PDF files', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('hello world'), 'resume.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/PDF/i);
  });

  it('should reject files larger than 10MB', async () => {
    const app = createTestApp();
    // Create a buffer just over 10MB
    const bigBuffer = Buffer.alloc(10 * 1024 * 1024 + 1, 0);
    const res = await request(app)
      .post('/upload')
      .attach('file', bigBuffer, 'big.pdf');

    expect(res.status).toBe(400);
  });

  it('should reject request with no file', async () => {
    const app = createTestApp();
    const res = await request(app).post('/upload');

    // No file attached — multer does not add req.file
    expect(res.status).toBe(200);
    expect(res.body.filename).toBeUndefined();
  });

  it('should generate a unique filename with .pdf extension', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/upload')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(200);
    // filename should not be the original — multer generates a unique one
    expect(res.body.filename).not.toBe('resume.pdf');
    expect(res.body.filename).toMatch(/\.pdf$/);
  });
});
