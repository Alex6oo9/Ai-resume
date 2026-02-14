import express from 'express';
import request from 'supertest';

jest.mock('../../services/ai/atsScorer');
jest.mock('../../services/ai/improvementAnalyzer');
jest.mock('../../config/openai', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { calculateAtsScore } from '../../services/ai/atsScorer';
import { analyzeImprovements } from '../../services/ai/improvementAnalyzer';
import pool from '../../config/db';
import { analysisValidators } from '../../middleware/validators/analysisValidators';
import { validate } from '../../middleware/validate';
import {
  getMatchPercentage,
  getAtsScore,
  getImprovements,
} from '../analysisController';

const mockAtsScore = calculateAtsScore as jest.Mock;
const mockImprovements = analyzeImprovements as jest.Mock;
const mockQuery = (pool as any).query as jest.Mock;

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

  app.post('/api/analysis/match', analysisValidators, validate, getMatchPercentage);
  app.post('/api/analysis/ats-score', analysisValidators, validate, getAtsScore);
  app.post('/api/analysis/improve', analysisValidators, validate, getImprovements);

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

describe('POST /api/analysis/match', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached match data (200)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          match_percentage: 75,
          ai_analysis: JSON.stringify({
            strengths: ['Good React skills'],
            weaknesses: ['No TypeScript'],
            suggestions: ['Learn TypeScript'],
          }),
        },
      ],
    });

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/match')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(200);
    expect(res.body.matchPercentage).toBe(75);
    expect(res.body.strengths).toEqual(['Good React skills']);
    expect(res.body.weaknesses).toEqual(['No TypeScript']);
  });

  it('should return 404 for non-existent resume', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/match')
      .send({ resumeId: 'nonexistent' });

    expect(res.status).toBe(404);
  });

  it('should return 400 for missing resumeId', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/match')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should reject unauthenticated requests', async () => {
    const app = createApp(false);
    const res = await request(app)
      .post('/api/analysis/match')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/analysis/ats-score', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached ATS score when available (200)', async () => {
    const cachedBreakdown = {
      formatCompliance: 35,
      keywordMatch: 30,
      sectionCompleteness: 18,
      totalScore: 83,
      keywords: { matched: ['React'], missing: ['TypeScript'] },
    };

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          ats_score: 83,
          parsed_text: 'John Doe...',
          target_role: 'Frontend Developer',
          ai_analysis: JSON.stringify({ atsBreakdown: cachedBreakdown }),
        },
      ],
    });

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/ats-score')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(200);
    expect(res.body.atsBreakdown).toEqual(cachedBreakdown);
    expect(mockAtsScore).not.toHaveBeenCalled();
  });

  it('should compute and cache ATS score when null (200)', async () => {
    const computedBreakdown = {
      formatCompliance: 30,
      keywordMatch: 25,
      sectionCompleteness: 15,
      totalScore: 70,
      keywords: { matched: ['React'], missing: ['TypeScript'] },
    };

    // First query: get resume (ats_score is null)
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          ats_score: null,
          parsed_text: 'John Doe software engineer',
          target_role: 'Frontend Developer',
          ai_analysis: JSON.stringify({
            strengths: ['Good'],
            weaknesses: ['Bad'],
            suggestions: ['Improve'],
          }),
        },
      ],
    });

    mockAtsScore.mockResolvedValue(computedBreakdown);

    // Second query: update resume with ATS score
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'resume-1' }] });

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/ats-score')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(200);
    expect(res.body.atsBreakdown).toEqual(computedBreakdown);
    expect(mockAtsScore).toHaveBeenCalledWith({
      resumeText: 'John Doe software engineer',
      targetRole: 'Frontend Developer',
    });
    // Should update DB with score
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('should return 404 for non-existent resume', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/ats-score')
      .send({ resumeId: 'nonexistent' });

    expect(res.status).toBe(404);
  });

  it('should return 500 on AI service failure', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          ats_score: null,
          parsed_text: 'Some text',
          target_role: 'Developer',
          ai_analysis: JSON.stringify({}),
        },
      ],
    });

    mockAtsScore.mockRejectedValue(new Error('OpenAI error'));

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/ats-score')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(500);
  });
});

describe('POST /api/analysis/improve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return suggestions and detailed improvements (200)', async () => {
    const detailedResult = {
      actionVerbs: [{ current: 'worked on', suggested: 'Engineered' }],
      quantifiedAchievements: [{ suggestion: 'Add metrics' }],
      missingSections: ['Certifications'],
      keywordOptimization: [{ keyword: 'TypeScript', reason: 'In demand' }],
      formattingIssues: ['Add section headers'],
    };

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'John Doe...',
          target_role: 'Frontend Developer',
          ai_analysis: JSON.stringify({
            suggestions: ['Improve formatting', 'Add skills'],
          }),
        },
      ],
    });

    mockImprovements.mockResolvedValue(detailedResult);

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/improve')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(200);
    expect(res.body.suggestions).toEqual(['Improve formatting', 'Add skills']);
    expect(res.body.detailed).toEqual(detailedResult);
    expect(mockImprovements).toHaveBeenCalledWith({
      resumeText: 'John Doe...',
      targetRole: 'Frontend Developer',
    });
  });

  it('should return 404 for non-existent resume', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/improve')
      .send({ resumeId: 'nonexistent' });

    expect(res.status).toBe(404);
  });

  it('should return 500 on AI failure', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'Some text',
          target_role: 'Developer',
          ai_analysis: JSON.stringify({ suggestions: [] }),
        },
      ],
    });

    mockImprovements.mockRejectedValue(new Error('AI service down'));

    const app = createApp();
    const res = await request(app)
      .post('/api/analysis/improve')
      .send({ resumeId: 'resume-1' });

    expect(res.status).toBe(500);
  });
});
