import express from 'express';
import request from 'supertest';
import path from 'path';
import fs from 'fs';

// Mock dependencies before importing the modules that use them
jest.mock('../../services/parser/pdfParser');
jest.mock('../../services/ai/resumeAnalyzer');
jest.mock('../../config/openai', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { extractTextFromPDF } from '../../services/parser/pdfParser';
import { analyzeResume } from '../../services/ai/resumeAnalyzer';
import pool from '../../config/db';
import { uploadMiddleware } from '../../middleware/upload';
import { resumeValidators } from '../../middleware/validators/resumeValidators';
import { validate } from '../../middleware/validate';
import { uploadResume } from '../resumeController';

const mockExtract = extractTextFromPDF as jest.Mock;
const mockAnalyze = analyzeResume as jest.Mock;
const mockQuery = (pool as any).query as jest.Mock;

const UPLOADS_DIR = path.join(__dirname, '../../../uploads-test-ctrl');

function createMinimalPdf(): Buffer {
  const pdfContent =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';
  return Buffer.from(pdfContent);
}

// Create test app simulating the real route setup
function createApp(authenticated = true, userId = 'test-user-123') {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Simulate authentication middleware
  app.use((req, _res, next) => {
    if (authenticated) {
      (req as any).user = { id: userId };
      req.isAuthenticated = (() => true) as any;
    } else {
      req.isAuthenticated = (() => false) as any;
    }
    next();
  });

  // Auth check middleware
  app.use((req, res, next) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  });

  app.post(
    '/api/resume/upload',
    uploadMiddleware(UPLOADS_DIR).single('file'),
    resumeValidators,
    validate,
    uploadResume
  );

  // Error handler — multer errors get 400, everything else 500
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err.name === 'MulterError' || err.message === 'Only PDF files are allowed') {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  );

  return app;
}

describe('POST /api/resume/upload', () => {
  beforeAll(() => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clean uploaded files between tests
    if (fs.existsSync(UPLOADS_DIR)) {
      for (const f of fs.readdirSync(UPLOADS_DIR)) {
        fs.unlinkSync(path.join(UPLOADS_DIR, f));
      }
    }
  });

  it('should successfully upload, parse, analyze, and create a resume (201)', async () => {
    mockExtract.mockResolvedValue('John Doe Software Engineer');
    mockAnalyze.mockResolvedValue({
      matchPercentage: 80,
      aiAnalysis: {
        strengths: ['Good experience'],
        weaknesses: ['Missing skills'],
        suggestions: ['Add certifications'],
      },
    });
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 'resume-uuid',
          user_id: 'test-user-123',
          file_path: '/uploads/test.pdf',
          parsed_text: 'John Doe Software Engineer',
          target_role: 'Frontend Developer',
          target_country: 'United States',
          target_city: 'NYC',
          match_percentage: 80,
          ai_analysis: {
            strengths: ['Good experience'],
            weaknesses: ['Missing skills'],
            suggestions: ['Add certifications'],
          },
        },
      ],
    });

    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Frontend Developer')
      .field('targetCountry', 'United States')
      .field('targetCity', 'NYC')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(201);
    expect(res.body.resume).toBeDefined();
    expect(res.body.resume.target_role).toBe('Frontend Developer');
    expect(mockExtract).toHaveBeenCalledTimes(1);
    expect(mockAnalyze).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('should reject unauthenticated requests (401)', async () => {
    const app = createApp(false);
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Developer')
      .field('targetCountry', 'US')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(401);
  });

  it('should reject non-PDF files (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Developer')
      .field('targetCountry', 'US')
      .attach('file', Buffer.from('not a pdf'), 'resume.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/PDF/i);
  });

  it('should reject missing targetRole (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetCountry', 'US')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(400);
  });

  it('should reject missing targetCountry (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Developer')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(400);
  });

  it('should reject when no file is attached (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Developer')
      .field('targetCountry', 'US');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/file/i);
  });

  it('should clean up file on parser failure', async () => {
    mockExtract.mockRejectedValue(new Error('PDF parsing failed'));

    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Developer')
      .field('targetCountry', 'US')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(500);
    // Verify no leftover files in uploads dir
    const files = fs.readdirSync(UPLOADS_DIR);
    expect(files.length).toBe(0);
  });

  it('should clean up file on AI service failure', async () => {
    mockExtract.mockResolvedValue('Some text');
    mockAnalyze.mockRejectedValue(new Error('OpenAI API error'));

    const app = createApp();
    const res = await request(app)
      .post('/api/resume/upload')
      .field('targetRole', 'Developer')
      .field('targetCountry', 'US')
      .attach('file', createMinimalPdf(), 'resume.pdf');

    expect(res.status).toBe(500);
    const files = fs.readdirSync(UPLOADS_DIR);
    expect(files.length).toBe(0);
  });
});
