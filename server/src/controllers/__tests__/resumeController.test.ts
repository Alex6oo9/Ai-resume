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
import { uploadResume, saveDraft, loadDraft } from '../resumeController';

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
        try {
          fs.unlinkSync(path.join(UPLOADS_DIR, f));
        } catch (e: any) {
          // Ignore EBUSY (Windows file locking) and ENOENT (already deleted)
          if (e.code !== 'EBUSY' && e.code !== 'ENOENT') throw e;
        }
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

describe('POST /api/resume/draft/save', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleFormData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    city: 'New York',
    country: 'USA',
    targetRole: 'Software Engineer',
    targetIndustry: 'Technology',
    targetCountry: 'USA',
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], soft: [], languages: [] },
    professionalSummary: '',
  };

  function createDraftApp(authenticated = true, userId = 'test-user-123') {
    const app = express();
    app.use(express.json());

    app.use((req, _res, next) => {
      if (authenticated) {
        (req as any).user = { id: userId };
      }
      next();
    });

    app.post('/api/resume/draft/save', saveDraft);

    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    });

    return app;
  }

  it('should create new draft successfully', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'new-resume-123' }] }) // INSERT resumes
      .mockResolvedValueOnce({ rows: [] }); // INSERT resume_data

    const app = createDraftApp();
    const res = await request(app)
      .post('/api/resume/draft/save')
      .send({ formData: sampleFormData });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resumeId).toBe('new-resume-123');
    expect(res.body.message).toBe('Draft saved successfully');

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO resumes'),
      expect.arrayContaining(['test-user-123', 'Software Engineer', 'USA'])
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO resume_data'),
      expect.arrayContaining(['new-resume-123', JSON.stringify(sampleFormData)])
    );
  });

  it('should update existing draft successfully', async () => {
    const existingId = 'existing-123';
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: existingId }] }) // SELECT existing
      .mockResolvedValueOnce({ rows: [] }) // UPDATE resumes
      .mockResolvedValueOnce({ rows: [] }); // UPSERT resume_data

    const app = createDraftApp();
    const res = await request(app)
      .post('/api/resume/draft/save')
      .send({ resumeId: existingId, formData: sampleFormData });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resumeId).toBe(existingId);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id FROM resumes WHERE id'),
      [existingId, 'test-user-123']
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE resumes'),
      expect.arrayContaining(['Software Engineer', 'USA'])
    );
  });

  it('should return 400 if formData is missing', async () => {
    const app = createDraftApp();
    const res = await request(app).post('/api/resume/draft/save').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Form data is required');
  });

  it('should return 404 if resumeId does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // No existing resume

    const app = createDraftApp();
    const res = await request(app)
      .post('/api/resume/draft/save')
      .send({ resumeId: 'non-existent-123', formData: sampleFormData });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resume not found');
  });

  it('should set status to "draft" and created_with_live_preview to true', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'new-resume-123' }] })
      .mockResolvedValueOnce({ rows: [] });

    const app = createDraftApp();
    await request(app)
      .post('/api/resume/draft/save')
      .send({ formData: sampleFormData });

    const insertCall = mockQuery.mock.calls.find((call) =>
      call[0].includes('INSERT INTO resumes')
    );
    expect(insertCall).toBeTruthy();
    // Check SQL query string contains status='draft' and created_with_live_preview=true
    expect(insertCall[0]).toContain("'draft'");
    expect(insertCall[0]).toContain('true');
  });
});

describe('GET /api/resume/draft/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleFormData = {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    targetRole: 'Data Analyst',
  };

  function createLoadApp(authenticated = true, userId = 'test-user-123') {
    const app = express();
    app.use(express.json());

    app.use((req, _res, next) => {
      if (authenticated) {
        (req as any).user = { id: userId };
      }
      next();
    });

    app.get('/api/resume/draft/:id', loadDraft);

    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    });

    return app;
  }

  it('should load draft successfully', async () => {
    const resumeId = 'resume-123';
    const updatedAt = new Date().toISOString();

    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: resumeId, updated_at: updatedAt }] }) // SELECT resume
      .mockResolvedValueOnce({ rows: [{ form_data: sampleFormData }] }); // SELECT form_data

    const app = createLoadApp();
    const res = await request(app).get(`/api/resume/draft/${resumeId}`);

    expect(res.status).toBe(200);
    expect(res.body.resumeId).toBe(resumeId);
    expect(res.body.formData).toEqual(sampleFormData);
    expect(res.body.updatedAt).toBe(updatedAt);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, updated_at FROM resumes'),
      [resumeId, 'test-user-123']
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT form_data FROM resume_data'),
      [resumeId]
    );
  });

  it('should return 404 if resume not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // No resume

    const app = createLoadApp();
    const res = await request(app).get('/api/resume/draft/non-existent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resume not found');
  });

  it('should return 404 if resume_data not found', async () => {
    const resumeId = 'resume-123';
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: resumeId, updated_at: new Date() }] })
      .mockResolvedValueOnce({ rows: [] }); // No form_data

    const app = createLoadApp();
    const res = await request(app).get(`/api/resume/draft/${resumeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resume data not found');
  });

  it('should only return resume belonging to authenticated user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // Different user

    const app = createLoadApp(true, 'different-user');
    const res = await request(app).get('/api/resume/draft/resume-123');

    expect(res.status).toBe(404);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.anything(),
      ['resume-123', 'different-user']
    );
  });
});
