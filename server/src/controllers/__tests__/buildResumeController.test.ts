import express from 'express';
import request from 'supertest';

jest.mock('../../services/ai/resumeGenerator');
jest.mock('../../config/openai', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { generateResume } from '../../services/ai/resumeGenerator';
import pool from '../../config/db';
import { buildResumeValidators } from '../../middleware/validators/resumeValidators';
import { validate } from '../../middleware/validate';
import { buildResume } from '../resumeController';

const mockGenerate = generateResume as jest.Mock;
const mockQuery = (pool as any).query as jest.Mock;

const validFormData = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+1-555-0100',
  city: 'San Francisco',
  country: 'United States',
  targetRole: 'Frontend Developer',
  targetCountry: 'United States',
  education: [
    {
      degreeType: 'BS',
      major: 'Computer Science',
      university: 'Stanford',
      graduationDate: '2024-06',
      relevantCoursework: 'Algorithms',
    },
  ],
  experience: [],
  projects: [],
  technicalSkills: 'React, JavaScript',
  softSkills: ['Teamwork'],
  languages: [{ name: 'English', proficiency: 'native' }],
  professionalSummary: 'Motivated graduate.',
};

function createApp(authenticated = true, userId = 'user-123') {
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

  app.use((req, res, next) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  });

  app.post('/api/resume/build', buildResumeValidators, validate, buildResume);

  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(500).json({ error: err.message });
    }
  );

  return app;
}

describe('POST /api/resume/build', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a resume from form data (201)', async () => {
    mockGenerate.mockResolvedValue({
      resumeText: 'JANE SMITH\nFrontend Developer...',
      matchPercentage: 78,
      aiAnalysis: {
        strengths: ['Good skills'],
        weaknesses: ['Limited experience'],
        suggestions: ['Add projects'],
      },
    });

    // First query: insert into resumes
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-uuid',
          user_id: 'user-123',
          parsed_text: 'JANE SMITH\nFrontend Developer...',
          target_role: 'Frontend Developer',
          target_country: 'United States',
          match_percentage: 78,
          ai_analysis: {
            strengths: ['Good skills'],
            weaknesses: ['Limited experience'],
            suggestions: ['Add projects'],
          },
        },
      ],
    });

    // Second query: insert into resume_data
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'data-uuid' }] });

    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send(validFormData);

    expect(res.status).toBe(201);
    expect(res.body.resume).toBeDefined();
    expect(res.body.resume.target_role).toBe('Frontend Developer');
    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('should reject unauthenticated requests (401)', async () => {
    const app = createApp(false);
    const res = await request(app)
      .post('/api/resume/build')
      .send(validFormData);

    expect(res.status).toBe(401);
  });

  it('should reject missing fullName (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send({ ...validFormData, fullName: '' });

    expect(res.status).toBe(400);
  });

  it('should reject missing targetRole (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send({ ...validFormData, targetRole: '' });

    expect(res.status).toBe(400);
  });

  it('should reject missing targetCountry (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send({ ...validFormData, targetCountry: '' });

    expect(res.status).toBe(400);
  });

  it('should reject missing education array (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send({ ...validFormData, education: [] });

    expect(res.status).toBe(400);
  });

  it('should reject missing professionalSummary (400)', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send({ ...validFormData, professionalSummary: '' });

    expect(res.status).toBe(400);
  });

  it('should handle AI service failure (500)', async () => {
    mockGenerate.mockRejectedValue(new Error('OpenAI error'));

    const app = createApp();
    const res = await request(app)
      .post('/api/resume/build')
      .send(validFormData);

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('OpenAI error');
  });
});
