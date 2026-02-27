import express from 'express';
import request from 'supertest';

jest.mock('../../services/export/pdfGenerator');
jest.mock('../../services/export/markdownGenerator');
jest.mock('../../services/export/htmlTemplate');
jest.mock('../../config/openai', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { generatePdf } from '../../services/export/pdfGenerator';
import { generateMarkdown } from '../../services/export/markdownGenerator';
import { buildResumeHtml } from '../../services/export/htmlTemplate';
import pool from '../../config/db';
import { exportPdf, exportMarkdown } from '../exportController';

const mockGeneratePdf = generatePdf as jest.Mock;
const mockGenerateMarkdown = generateMarkdown as jest.Mock;
const mockBuildHtml = buildResumeHtml as jest.Mock;
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

  app.get('/api/export/pdf/:resumeId', exportPdf);
  app.get('/api/export/markdown/:resumeId', exportMarkdown);

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

describe('GET /api/export/pdf/:resumeId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return PDF buffer with correct headers (200)', async () => {
    // Resume query
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'John Doe\nSoftware Engineer',
          target_role: 'Frontend Developer',
        },
      ],
    });

    // resume_data query - JSONB is already parsed by PostgreSQL
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          form_data: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '555-0000',
            city: 'NYC',
            country: 'US',
            targetRole: 'Frontend Developer',
            targetCountry: 'US',
            education: [],
            experience: [],
            projects: [],
            technicalSkills: 'React',
            softSkills: [],
            languages: [],
            professionalSummary: 'Experienced dev',
          },
        },
      ],
    });

    mockBuildHtml.mockReturnValue('<html>resume</html>');
    mockGeneratePdf.mockResolvedValue(Buffer.from('pdf-content'));

    const app = createApp();
    const res = await request(app).get('/api/export/pdf/resume-1');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(
      /attachment; filename="resume\.pdf"/
    );
    expect(mockBuildHtml).toHaveBeenCalledWith(
      expect.objectContaining({ formData: expect.any(Object) })
    );
    expect(mockGeneratePdf).toHaveBeenCalled();
  });

  it('should use parsed text fallback when no form data (200)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'John Doe resume text',
          target_role: 'Developer',
        },
      ],
    });

    // No form_data
    mockQuery.mockResolvedValueOnce({ rows: [] });

    mockBuildHtml.mockReturnValue('<html>text</html>');
    mockGeneratePdf.mockResolvedValue(Buffer.from('pdf-content'));

    const app = createApp();
    const res = await request(app).get('/api/export/pdf/resume-1');

    expect(res.status).toBe(200);
    expect(mockBuildHtml).toHaveBeenCalledWith(
      expect.objectContaining({
        parsedText: 'John Doe resume text',
        targetRole: 'Developer',
      })
    );
  });

  it('should return 404 when resume not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const app = createApp();
    const res = await request(app).get('/api/export/pdf/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should return 400 when resumeId is whitespace', async () => {
    const app = createApp();
    const res = await request(app).get('/api/export/pdf/%20');

    expect(res.status).toBe(400);
  });

  it('should return 500 on PDF generation failure', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'Some text',
          target_role: 'Developer',
        },
      ],
    });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockBuildHtml.mockReturnValue('<html></html>');
    mockGeneratePdf.mockRejectedValue(new Error('Puppeteer crash'));

    const app = createApp();
    const res = await request(app).get('/api/export/pdf/resume-1');

    expect(res.status).toBe(500);
  });

  it('should reject unauthenticated requests', async () => {
    const app = createApp(false);
    const res = await request(app).get('/api/export/pdf/resume-1');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/export/markdown/:resumeId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return markdown with correct headers (200)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'Jane Doe resume',
          target_role: 'Backend Developer',
        },
      ],
    });

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          form_data: JSON.stringify({
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '555-1111',
            city: 'LA',
            country: 'US',
            targetRole: 'Backend Developer',
            targetCountry: 'US',
            education: [],
            experience: [],
            projects: [],
            technicalSkills: 'Node.js',
            softSkills: [],
            languages: [],
            professionalSummary: 'Backend expert',
          }),
        },
      ],
    });

    mockGenerateMarkdown.mockReturnValue('# Jane Doe\n\nBackend expert');

    const app = createApp();
    const res = await request(app).get('/api/export/markdown/resume-1');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/markdown/);
    expect(res.headers['content-disposition']).toMatch(
      /attachment; filename="resume\.md"/
    );
    expect(res.text).toBe('# Jane Doe\n\nBackend expert');
  });

  it('should use parsed text fallback when no form data (200)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'Plain resume text',
          target_role: 'Designer',
        },
      ],
    });

    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockGenerateMarkdown.mockReturnValue('# Resume\n\nPlain resume text');

    const app = createApp();
    const res = await request(app).get('/api/export/markdown/resume-1');

    expect(res.status).toBe(200);
    expect(mockGenerateMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({
        parsedText: 'Plain resume text',
        targetRole: 'Designer',
      })
    );
  });

  it('should return 404 when resume not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const app = createApp();
    const res = await request(app).get('/api/export/markdown/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should return 400 when resumeId is whitespace', async () => {
    const app = createApp();
    const res = await request(app).get('/api/export/markdown/%20');

    expect(res.status).toBe(400);
  });

  it('should return 500 on generation failure', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'resume-1',
          user_id: 'user-123',
          parsed_text: 'Some text',
          target_role: 'Developer',
        },
      ],
    });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockGenerateMarkdown.mockImplementation(() => {
      throw new Error('Generation failed');
    });

    const app = createApp();
    const res = await request(app).get('/api/export/markdown/resume-1');

    expect(res.status).toBe(500);
  });

  it('should reject unauthenticated requests', async () => {
    const app = createApp(false);
    const res = await request(app).get('/api/export/markdown/resume-1');

    expect(res.status).toBe(401);
  });
});
