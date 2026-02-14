import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE imports
jest.mock('../../services/ai/skillsGenerator', () => ({
  generateSkills: jest.fn(),
}));

jest.mock('../../services/ai/summaryGenerator', () => ({
  generateSummary: jest.fn(),
}));

import {
  generateSkillsEndpoint,
  generateSummaryEndpoint,
} from '../aiController';
import { generateSkills } from '../../services/ai/skillsGenerator';
import { generateSummary } from '../../services/ai/summaryGenerator';

const mockGenerateSkills = generateSkills as jest.Mock;
const mockGenerateSummary = generateSummary as jest.Mock;

describe('aiController', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.clearAllMocks();
  });

  // Add error handler middleware for tests
  const addErrorHandler = () => {
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    });
  };

  describe('POST /generate-skills', () => {
    beforeEach(() => {
      app.post('/generate-skills', generateSkillsEndpoint);
      addErrorHandler();
    });

    const mockSkills = {
      technical: [
        {
          category: 'Programming Languages',
          items: ['Python', 'JavaScript', 'SQL'],
        },
      ],
      soft: ['Communication', 'Teamwork', 'Problem-solving'],
      languages: [{ language: 'English', proficiency: 'fluent' as const }],
    };

    it('should generate skills successfully', async () => {
      mockGenerateSkills.mockResolvedValueOnce(mockSkills);

      const response = await request(app)
        .post('/generate-skills')
        .send({
          targetRole: 'Junior Data Analyst',
          targetIndustry: 'Technology',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSkills);
      expect(mockGenerateSkills).toHaveBeenCalledWith(
        'Junior Data Analyst',
        'Technology'
      );
    });

    it('should return 400 if targetRole is missing', async () => {
      const response = await request(app)
        .post('/generate-skills')
        .send({
          targetIndustry: 'Technology',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Target role is required');
      expect(mockGenerateSkills).not.toHaveBeenCalled();
    });

    it('should return 400 if targetRole is not a string', async () => {
      const response = await request(app)
        .post('/generate-skills')
        .send({
          targetRole: 123,
          targetIndustry: 'Technology',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Target role is required');
      expect(mockGenerateSkills).not.toHaveBeenCalled();
    });

    it('should return 400 if targetIndustry is missing', async () => {
      const response = await request(app)
        .post('/generate-skills')
        .send({
          targetRole: 'Developer',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Target industry is required');
      expect(mockGenerateSkills).not.toHaveBeenCalled();
    });

    it('should return 400 if targetIndustry is not a string', async () => {
      const response = await request(app)
        .post('/generate-skills')
        .send({
          targetRole: 'Developer',
          targetIndustry: 123,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Target industry is required');
      expect(mockGenerateSkills).not.toHaveBeenCalled();
    });

    it('should trim whitespace from inputs', async () => {
      mockGenerateSkills.mockResolvedValueOnce(mockSkills);

      await request(app)
        .post('/generate-skills')
        .send({
          targetRole: '  Junior Data Analyst  ',
          targetIndustry: '  Technology  ',
        });

      expect(mockGenerateSkills).toHaveBeenCalledWith(
        'Junior Data Analyst',
        'Technology'
      );
    });

    it('should return 500 if service throws error', async () => {
      mockGenerateSkills.mockRejectedValueOnce(new Error('OpenAI API failure'));

      const response = await request(app)
        .post('/generate-skills')
        .send({
          targetRole: 'Developer',
          targetIndustry: 'Technology',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /generate-summary', () => {
    beforeEach(() => {
      app.post('/generate-summary', generateSummaryEndpoint);
      addErrorHandler();
    });

    const mockSummaryText =
      'Recent Computer Science graduate with experience in full-stack development.';

    it('should generate summary successfully with full context', async () => {
      mockGenerateSummary.mockResolvedValueOnce(mockSummaryText);

      const response = await request(app)
        .post('/generate-summary')
        .send({
          targetRole: 'Software Developer',
          targetCountry: 'United States',
          targetIndustry: 'Technology',
          education: [
            {
              degree: 'B.S.',
              field: 'Computer Science',
              institution: 'MIT',
            },
          ],
          experience: [
            {
              position: 'Intern',
              company: 'Google',
              type: 'internship',
            },
          ],
          projects: [{ name: 'Portfolio Website' }],
          skills: {
            technical: [
              {
                category: 'Programming',
                items: ['JavaScript', 'Python'],
              },
            ],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ summary: mockSummaryText });
      expect(mockGenerateSummary).toHaveBeenCalledWith({
        targetRole: 'Software Developer',
        targetCountry: 'United States',
        targetIndustry: 'Technology',
        education: expect.any(Array),
        experience: expect.any(Array),
        projects: expect.any(Array),
        skills: expect.any(Object),
      });
    });

    it('should generate summary with minimal context', async () => {
      mockGenerateSummary.mockResolvedValueOnce(mockSummaryText);

      const response = await request(app)
        .post('/generate-summary')
        .send({
          targetRole: 'Developer',
          targetCountry: 'Canada',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ summary: mockSummaryText });
      expect(mockGenerateSummary).toHaveBeenCalledWith({
        targetRole: 'Developer',
        targetCountry: 'Canada',
        targetIndustry: undefined,
        education: undefined,
        experience: undefined,
        projects: undefined,
        skills: undefined,
      });
    });

    it('should return 400 if targetRole is missing', async () => {
      const response = await request(app)
        .post('/generate-summary')
        .send({
          targetCountry: 'USA',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Target role is required');
      expect(mockGenerateSummary).not.toHaveBeenCalled();
    });

    it('should return 400 if targetCountry is missing', async () => {
      const response = await request(app)
        .post('/generate-summary')
        .send({
          targetRole: 'Developer',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Target country is required');
      expect(mockGenerateSummary).not.toHaveBeenCalled();
    });

    it('should trim whitespace from inputs', async () => {
      mockGenerateSummary.mockResolvedValueOnce(mockSummaryText);

      await request(app)
        .post('/generate-summary')
        .send({
          targetRole: '  Developer  ',
          targetCountry: '  USA  ',
          targetIndustry: '  Tech  ',
        });

      expect(mockGenerateSummary).toHaveBeenCalledWith({
        targetRole: 'Developer',
        targetCountry: 'USA',
        targetIndustry: 'Tech',
        education: undefined,
        experience: undefined,
        projects: undefined,
        skills: undefined,
      });
    });

    it('should return 500 if service throws error', async () => {
      mockGenerateSummary.mockRejectedValueOnce(new Error('OpenAI API failure'));

      const response = await request(app)
        .post('/generate-summary')
        .send({
          targetRole: 'Developer',
          targetCountry: 'USA',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();
    });
  });
});
