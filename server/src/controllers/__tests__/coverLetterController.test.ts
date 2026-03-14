import express from 'express';
import request from 'supertest';

// Mock DB and AI services before importing controller
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

jest.mock('../../services/ai/coverLetterGenerator', () => ({
  generateCoverLetter: jest.fn(),
}));

jest.mock('../../services/ai/keywordExtractor', () => ({
  extractKeywords: jest.fn(),
}));

jest.mock('../../config/openai', () => ({
  __esModule: true,
  default: {},
}));

import pool from '../../config/db';
import { generateCoverLetter as mockGenerateService } from '../../services/ai/coverLetterGenerator';
import { extractKeywords as mockExtractKeywordsService } from '../../services/ai/keywordExtractor';
import {
  extractKeywords,
  generateCoverLetter,
  listCoverLetters,
  listCoverLettersByResume,
  getCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  regenerateCoverLetter,
} from '../coverLetterController';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate';

const mockQuery = (pool as any).query as jest.Mock;
const mockGenerate = mockGenerateService as jest.Mock;
const mockExtractKeywords = mockExtractKeywordsService as jest.Mock;

// Valid UUID4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y ∈ {8,9,a,b}
const RESUME_ID = '11111111-1111-4111-8111-111111111111';
const LETTER_ID = '22222222-2222-4222-8222-222222222222';
const USER_ID   = '33333333-3333-4333-8333-333333333333';

const mockResume = {
  id: RESUME_ID,
  user_id: USER_ID,
  target_role: 'Frontend Developer',
  target_country: 'United States',
  target_city: 'San Francisco',
  parsed_text: 'Jane Doe\nSoftware Engineer',
  job_description: 'React developer needed',
  ai_analysis: {
    atsBreakdown: {
      keywords: { matched: ['React'], missing: ['TypeScript'] },
    },
  },
  form_data: null,
};

const mockCoverLetterRecord = {
  id: LETTER_ID,
  resume_id: RESUME_ID,
  user_id: USER_ID,
  content: 'Dear Hiring Manager...',
  generated_content: 'Dear Hiring Manager...',
  tone: 'professional',
  word_count_target: 'medium',
  company_name: 'Acme Corp',
  hiring_manager_name: 'John Smith',
  job_title: null,
  custom_instructions: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function createApp(authenticated = true, userId = USER_ID) {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    if (authenticated) {
      (req as any).user = { id: userId };
      req.isAuthenticated = (() => true) as any;
    } else {
      req.isAuthenticated = (() => false) as any;
    }
    next();
  });

  const authCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  };

  const extractKeywordsValidators = [
    body('resumeId').exists().isUUID(),
    body('jobDescription').exists().isString().notEmpty().isLength({ max: 5000 }),
  ];

  const generateValidators = [
    body('resumeId').exists().isUUID(),
    body('fullName').exists().isString().notEmpty(),
    body('targetRole').exists().isString().notEmpty(),
    body('targetLocation').exists().isString().notEmpty(),
    body('jobDescription').exists().isString().notEmpty().isLength({ max: 5000 }),
    body('companyName').exists().isString().notEmpty(),
    body('tone').exists().isIn(['professional', 'enthusiastic', 'formal', 'conversational']),
    body('wordCountTarget').exists().isIn(['short', 'medium', 'long']),
    body('hiringManagerName').optional().isString().isLength({ max: 255 }),
    body('jobTitle').optional().isString().isLength({ max: 255 }),
    body('customInstructions').optional().isString().isLength({ max: 500 }),
  ];

  const regenerateValidators = [
    body('fullName').exists().isString().notEmpty(),
    body('targetRole').exists().isString().notEmpty(),
    body('targetLocation').exists().isString().notEmpty(),
    body('jobDescription').exists().isString().notEmpty().isLength({ max: 5000 }),
    body('companyName').exists().isString().notEmpty(),
    body('tone').exists().isIn(['professional', 'enthusiastic', 'formal', 'conversational']),
    body('wordCountTarget').exists().isIn(['short', 'medium', 'long']),
    body('hiringManagerName').optional().isString().isLength({ max: 255 }),
    body('customInstructions').optional().isString().isLength({ max: 500 }),
  ];

  const updateValidators = [
    body('content').exists().isString().notEmpty().isLength({ max: 10000 }),
  ];

  // Static routes first, then dynamic — same ordering as production router
  app.post('/api/cover-letter/extract-keywords', authCheck, extractKeywordsValidators, validate, extractKeywords);
  app.get('/api/cover-letter/', authCheck, listCoverLetters);
  app.post('/api/cover-letter/generate', authCheck, generateValidators, validate, generateCoverLetter);
  app.get('/api/cover-letter/resume/:resumeId', authCheck, listCoverLettersByResume);
  app.get('/api/cover-letter/:id', authCheck, getCoverLetter);
  app.put('/api/cover-letter/:id', authCheck, updateValidators, validate, updateCoverLetter);
  app.delete('/api/cover-letter/:id', authCheck, deleteCoverLetter);
  app.post('/api/cover-letter/:id/regenerate', authCheck, regenerateValidators, validate, regenerateCoverLetter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}

describe('Cover Letter Controller', () => {
  beforeEach(() => {
    // resetAllMocks clears mock queues (mockResolvedValueOnce stacks) between tests
    jest.resetAllMocks();
    // Set safe defaults so pool.query never returns undefined
    mockQuery.mockResolvedValue({ rows: [] });
    mockGenerate.mockResolvedValue('Dear Hiring Manager,\n\nI am excited to apply...');
    mockExtractKeywords.mockResolvedValue({ matchedKeywords: ['React'], missingKeywords: ['Docker'] });
  });

  describe('POST /api/cover-letter/extract-keywords', () => {
    const validBody = {
      resumeId: RESUME_ID,
      jobDescription: 'Looking for a React developer with Docker experience',
    };

    it('returns 200 with matchedKeywords and missingKeywords when valid', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockResume] });
      mockExtractKeywords.mockResolvedValueOnce({
        matchedKeywords: ['React'],
        missingKeywords: ['Docker'],
      });

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/extract-keywords')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.matchedKeywords).toEqual(['React']);
      expect(res.body.missingKeywords).toEqual(['Docker']);
    });

    it('returns 404 when resume is not found or does not belong to user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/extract-keywords')
        .send(validBody);

      expect(res.status).toBe(404);
    });

    it('returns 400 when resume has no parseable content', async () => {
      const noContentResume = { ...mockResume, parsed_text: null, form_data: null };
      mockQuery.mockResolvedValueOnce({ rows: [noContentResume] });

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/extract-keywords')
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('no content');
    });

    it('returns 400 when resumeId is not a valid UUID', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/extract-keywords')
        .send({ resumeId: 'not-a-uuid', jobDescription: 'Some job description' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when jobDescription is empty', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/extract-keywords')
        .send({ resumeId: RESUME_ID, jobDescription: '' });

      expect(res.status).toBe(400);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app)
        .post('/api/cover-letter/extract-keywords')
        .send(validBody);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/cover-letter/', () => {
    it('returns 200 with coverLetters array', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCoverLetterRecord] });

      const app = createApp();
      const res = await request(app).get('/api/cover-letter/');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.coverLetters)).toBe(true);
      expect(res.body.coverLetters.length).toBe(1);
    });

    it('returns 200 with empty array when user has no cover letters', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app).get('/api/cover-letter/');

      expect(res.status).toBe(200);
      expect(res.body.coverLetters).toEqual([]);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app).get('/api/cover-letter/');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/cover-letter/generate', () => {
    const validGenerateBody = {
      resumeId: RESUME_ID,
      fullName: 'Jane Doe',
      targetRole: 'Frontend Developer',
      targetLocation: 'San Francisco, CA',
      jobDescription: 'React developer needed',
      companyName: 'Acme Corp',
      tone: 'professional',
      wordCountTarget: 'medium',
    };

    it('returns 201 with coverLetter in body including generated_content', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [mockResume] })          // resume fetch
        .mockResolvedValueOnce({ rows: [mockCoverLetterRecord] }); // insert

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send(validGenerateBody);

      expect(res.status).toBe(201);
      expect(res.body.coverLetter).toBeDefined();
      expect(res.body.coverLetter.generated_content).toBeDefined();
    });

    it('two sequential generate calls create two separate rows', async () => {
      const secondRecord = { ...mockCoverLetterRecord, id: '44444444-4444-4444-8444-444444444444', company_name: 'Beta Inc' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockResume] })
        .mockResolvedValueOnce({ rows: [mockCoverLetterRecord] })
        .mockResolvedValueOnce({ rows: [mockResume] })
        .mockResolvedValueOnce({ rows: [secondRecord] });

      const app = createApp();
      const res1 = await request(app).post('/api/cover-letter/generate').send(validGenerateBody);
      const res2 = await request(app).post('/api/cover-letter/generate').send({ ...validGenerateBody, companyName: 'Beta Inc' });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
      expect(res1.body.coverLetter.id).not.toBe(res2.body.coverLetter.id);
    });

    it('includes job_title when provided', async () => {
      const recordWithJobTitle = { ...mockCoverLetterRecord, job_title: 'Senior Engineer' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockResume] })
        .mockResolvedValueOnce({ rows: [recordWithJobTitle] });

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send({ ...validGenerateBody, jobTitle: 'Senior Engineer' });

      expect(res.status).toBe(201);
      expect(res.body.coverLetter.job_title).toBe('Senior Engineer');
    });

    it('returns 400 when resumeId is missing', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send({ tone: 'professional', wordCountTarget: 'medium' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when tone is invalid', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send({ ...validGenerateBody, tone: 'sarcastic' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when customInstructions exceeds 500 chars', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send({ ...validGenerateBody, customInstructions: 'A'.repeat(501) });

      expect(res.status).toBe(400);
    });

    it('returns 400 when resume has no content', async () => {
      const noContentResume = { ...mockResume, parsed_text: null, form_data: null };
      mockQuery.mockResolvedValueOnce({ rows: [noContentResume] });

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send(validGenerateBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('no content');
    });

    it('returns 404 when resume does not belong to user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send(validGenerateBody);

      expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app)
        .post('/api/cover-letter/generate')
        .send({ resumeId: RESUME_ID, tone: 'professional', wordCountTarget: 'medium' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/cover-letter/resume/:resumeId', () => {
    it('returns 200 with empty array when resume exists but has no letters', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: RESUME_ID }] }) // resume check
        .mockResolvedValueOnce({ rows: [] });                   // letters query

      const app = createApp();
      const res = await request(app).get(`/api/cover-letter/resume/${RESUME_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.coverLetters).toEqual([]);
    });

    it('returns 200 with letters array when letters exist', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: RESUME_ID }] })
        .mockResolvedValueOnce({ rows: [mockCoverLetterRecord] });

      const app = createApp();
      const res = await request(app).get(`/api/cover-letter/resume/${RESUME_ID}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.coverLetters)).toBe(true);
      expect(res.body.coverLetters.length).toBe(1);
    });

    it('returns 404 when resume does not belong to user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // resume check returns nothing

      const app = createApp();
      const res = await request(app).get(`/api/cover-letter/resume/${RESUME_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app).get(`/api/cover-letter/resume/${RESUME_ID}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/cover-letter/:id', () => {
    it('returns 200 with saved letter including content and generated_content', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCoverLetterRecord] });

      const app = createApp();
      const res = await request(app).get(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.coverLetter.content).toBeDefined();
      expect(res.body.coverLetter.generated_content).toBeDefined();
    });

    it('returns 404 when no cover letter exists', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app).get(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 when letter belongs to different user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // WHERE cl.id=$1 AND r.user_id=$2 fails

      const app = createApp(true, '99999999-9999-4999-8999-999999999999');
      const res = await request(app).get(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app).get(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/cover-letter/:id', () => {
    it('returns 200 with updated content', async () => {
      const updatedRecord = { ...mockCoverLetterRecord, content: 'Updated content here.' };
      mockQuery.mockResolvedValueOnce({ rows: [updatedRecord] });

      const app = createApp();
      const res = await request(app)
        .put(`/api/cover-letter/${LETTER_ID}`)
        .send({ content: 'Updated content here.' });

      expect(res.status).toBe(200);
      expect(res.body.coverLetter.content).toBe('Updated content here.');
    });

    it('confirms generated_content is unchanged after save', async () => {
      const updatedRecord = {
        ...mockCoverLetterRecord,
        content: 'User edited version',
        generated_content: 'Dear Hiring Manager...', // unchanged
      };
      mockQuery.mockResolvedValueOnce({ rows: [updatedRecord] });

      const app = createApp();
      const res = await request(app)
        .put(`/api/cover-letter/${LETTER_ID}`)
        .send({ content: 'User edited version' });

      expect(res.status).toBe(200);
      expect(res.body.coverLetter.generated_content).toBe('Dear Hiring Manager...');
    });

    it('returns 400 when content is empty', async () => {
      const app = createApp();
      const res = await request(app)
        .put(`/api/cover-letter/${LETTER_ID}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when content exceeds 10000 chars', async () => {
      const app = createApp();
      const res = await request(app)
        .put(`/api/cover-letter/${LETTER_ID}`)
        .send({ content: 'A'.repeat(10001) });

      expect(res.status).toBe(400);
    });

    it('returns 404 when letter not found or not owned by user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app)
        .put(`/api/cover-letter/${LETTER_ID}`)
        .send({ content: 'Some content here.' });

      expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app)
        .put(`/api/cover-letter/${LETTER_ID}`)
        .send({ content: 'Some content' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/cover-letter/:id', () => {
    it('returns 200 on successful delete', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: LETTER_ID }] });

      const app = createApp();
      const res = await request(app).delete(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });

    it('returns 404 when letter not found or not owned by user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app).delete(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app).delete(`/api/cover-letter/${LETTER_ID}`);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/cover-letter/:id/regenerate', () => {
    const validRegenBody = {
      fullName: 'Jane Doe',
      targetRole: 'Frontend Developer',
      targetLocation: 'San Francisco, CA',
      jobDescription: 'React developer needed',
      companyName: 'Acme Corp',
      tone: 'professional',
      wordCountTarget: 'medium',
    };

    it('returns 200 with updated content and generated_content', async () => {
      const updatedRecord = {
        ...mockCoverLetterRecord,
        content: 'New generated content...',
        generated_content: 'New generated content...',
      };
      mockQuery
        .mockResolvedValueOnce({ rows: [{ resume_id: RESUME_ID, parsed_text: 'Jane Doe', target_role: 'Dev', form_data: null }] }) // letter fetch
        .mockResolvedValueOnce({ rows: [updatedRecord] }); // update

      const app = createApp();
      const res = await request(app)
        .post(`/api/cover-letter/${LETTER_ID}/regenerate`)
        .send(validRegenBody);

      expect(res.status).toBe(200);
      expect(res.body.coverLetter.content).toBe('New generated content...');
      expect(res.body.coverLetter.generated_content).toBe('New generated content...');
    });

    it('returns 404 when letter not found or not owned by user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const res = await request(app)
        .post(`/api/cover-letter/${LETTER_ID}/regenerate`)
        .send(validRegenBody);

      expect(res.status).toBe(404);
    });

    it('returns 400 when required fields are missing', async () => {
      const app = createApp();
      const res = await request(app)
        .post(`/api/cover-letter/${LETTER_ID}/regenerate`)
        .send({ tone: 'professional', wordCountTarget: 'medium' });

      expect(res.status).toBe(400);
    });

    it('returns 401 when unauthenticated', async () => {
      const app = createApp(false);
      const res = await request(app)
        .post(`/api/cover-letter/${LETTER_ID}/regenerate`)
        .send(validRegenBody);

      expect(res.status).toBe(401);
    });
  });
});
