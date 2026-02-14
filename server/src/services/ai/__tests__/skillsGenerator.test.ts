// Mock dependencies BEFORE imports
jest.mock('../../../config/openai', () => ({
  __esModule: true,
  default: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock('../../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { generateSkills, GeneratedSkills } from '../skillsGenerator';
import pool from '../../../config/db';
import openai from '../../../config/openai';

const mockQuery = (pool as any).query as jest.Mock;
const mockCreate = openai.chat.completions.create as jest.Mock;

describe('skillsGenerator', () => {
  const mockSkills: GeneratedSkills = {
    technical: [
      { category: 'Programming Languages', items: ['Python', 'JavaScript', 'SQL'] },
      { category: 'Data Visualization', items: ['Tableau', 'Power BI'] },
    ],
    soft: [
      'Analytical Thinking',
      'Communication',
      'Teamwork',
      'Problem-solving',
      'Time Management',
    ],
    languages: [{ language: 'English', proficiency: 'fluent' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSkills', () => {
    it('should throw error if target role is missing', async () => {
      await expect(generateSkills('', 'Technology')).rejects.toThrow(
        'Target role is required'
      );
    });

    it('should throw error if target industry is missing', async () => {
      await expect(generateSkills('Junior Data Analyst', '')).rejects.toThrow(
        'Target industry is required'
      );
    });

    it('should return cached skills if available', async () => {
      // Mock cache hit
      mockQuery.mockResolvedValueOnce({
        rows: [{ cache_value: mockSkills }],
      } as any);

      const result = await generateSkills('Junior Data Analyst', 'Technology');

      expect(result).toEqual(mockSkills);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT cache_value FROM ai_cache'),
        ['skills:junior data analyst:technology']
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should generate skills with AI if cache miss', async () => {
      // Mock cache miss
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      // Mock OpenAI response
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSkills),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      // Mock cache storage (INSERT)
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await generateSkills('Junior Data Analyst', 'Technology');

      expect(result).toEqual(mockSkills);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
    });

    it('should store generated skills in cache', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any); // Cache miss

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSkills),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      mockQuery.mockResolvedValueOnce({ rows: [] } as any); // Cache storage

      await generateSkills('Junior Data Analyst', 'Technology');

      // Verify cache storage was called
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ai_cache'),
        expect.arrayContaining([
          'skills:junior data analyst:technology',
          expect.stringContaining('"technical"'),
        ])
      );
    });

    it('should normalize cache key (lowercase, trimmed)', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSkills),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await generateSkills('  Junior Data ANALYST  ', '  Technology  ');

      // Check first query (cache lookup) used normalized key
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        ['skills:junior data analyst:technology']
      );
    });

    it('should throw error if OpenAI returns no content', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await expect(
        generateSkills('Junior Data Analyst', 'Technology')
      ).rejects.toThrow('No response from AI');
    });

    it('should throw error if OpenAI returns invalid JSON', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'This is not JSON',
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await expect(
        generateSkills('Junior Data Analyst', 'Technology')
      ).rejects.toThrow();
    });

    it('should throw error if OpenAI returns invalid structure', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({ wrong: 'structure' }),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await expect(
        generateSkills('Junior Data Analyst', 'Technology')
      ).rejects.toThrow('Invalid response structure from AI');
    });

    it('should continue if cache retrieval fails', async () => {
      // Mock cache failure
      mockQuery.mockRejectedValueOnce(new Error('Database connection error'));

      // Mock successful AI generation
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSkills),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      mockQuery.mockResolvedValueOnce({ rows: [] } as any); // Cache storage

      const result = await generateSkills('Junior Data Analyst', 'Technology');

      expect(result).toEqual(mockSkills);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should continue if cache storage fails', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any); // Cache miss

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSkills),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      // Mock cache storage failure
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      // Should not throw - caching failure is graceful
      const result = await generateSkills('Junior Data Analyst', 'Technology');
      expect(result).toEqual(mockSkills);
    });

    it('should include role and industry in AI prompt', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSkills),
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await generateSkills('Marketing Coordinator', 'Finance');

      const call = mockCreate.mock.calls[0][0];
      const userMessage = call.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('Marketing Coordinator');
      expect(userMessage.content).toContain('Finance');
    });
  });
});
