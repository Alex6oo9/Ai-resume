import express from 'express';
import request from 'supertest';

jest.mock('../../config/openai', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from '../../config/db';
import { listResumes } from '../resumeController';

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

  app.get('/api/resume', listResumes);

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

describe('GET /api/resume', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return array of user resumes sorted by created_at DESC (200)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-2',
          target_role: 'Backend Developer',
          match_percentage: 80,
          ats_score: 75,
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'resume-1',
          target_role: 'Frontend Developer',
          match_percentage: 65,
          ats_score: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    });

    const app = createApp();
    const res = await request(app).get('/api/resume');

    expect(res.status).toBe(200);
    expect(res.body.resumes).toHaveLength(2);
    expect(res.body.resumes[0].id).toBe('resume-2');
    expect(res.body.resumes[1].id).toBe('resume-1');
  });

  it('should return empty array when no resumes (200)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const app = createApp();
    const res = await request(app).get('/api/resume');

    expect(res.status).toBe(200);
    expect(res.body.resumes).toEqual([]);
  });

  it('should reject unauthenticated requests (401)', async () => {
    const app = createApp(false);
    const res = await request(app).get('/api/resume');

    expect(res.status).toBe(401);
  });
});
