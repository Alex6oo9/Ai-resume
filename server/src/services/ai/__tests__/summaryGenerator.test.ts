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

import { generateSummary, SummaryGenerationInput } from '../summaryGenerator';
import openai from '../../../config/openai';

const mockCreate = openai.chat.completions.create as jest.Mock;

describe('summaryGenerator', () => {
  const mockSummary =
    'Recent Computer Science graduate from MIT with hands-on experience as a Data Intern at Google. Proficient in Python, SQL, and R with demonstrated ability to analyze complex datasets. Seeking Junior Data Analyst position to leverage analytical skills in the Technology industry.';

  const fullInput: SummaryGenerationInput = {
    targetRole: 'Junior Data Analyst',
    targetIndustry: 'Technology',
    targetCountry: 'United States',
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Massachusetts Institute of Technology',
      },
    ],
    experience: [
      {
        position: 'Data Analysis Intern',
        company: 'Google',
        type: 'internship',
      },
      {
        position: 'Research Assistant',
        company: 'MIT AI Lab',
        type: 'part-time',
      },
    ],
    projects: [
      { name: 'Sales Dashboard' },
      { name: 'COVID-19 Data Analysis' },
    ],
    skills: {
      technical: [
        {
          category: 'Programming Languages',
          items: ['Python', 'SQL', 'R'],
        },
        {
          category: 'Data Visualization',
          items: ['Tableau', 'Power BI'],
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSummary', () => {
    it('should throw error if target role is missing', async () => {
      await expect(
        generateSummary({ targetRole: '', targetCountry: 'USA' })
      ).rejects.toThrow('Target role is required');
    });

    it('should throw error if target country is missing', async () => {
      await expect(
        generateSummary({ targetRole: 'Developer', targetCountry: '' })
      ).rejects.toThrow('Target country is required');
    });

    it('should generate summary with full context', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      const result = await generateSummary(fullInput);

      expect(result).toBe(mockSummary);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        temperature: 0.4,
        max_tokens: 200,
      });
    });

    it('should generate summary with minimal context', async () => {
      const minimalInput: SummaryGenerationInput = {
        targetRole: 'Marketing Coordinator',
        targetCountry: 'Canada',
      };

      const minimalSummary =
        'Recent graduate seeking Marketing Coordinator position in Canada. Eager to apply academic knowledge and develop professional skills.';

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: minimalSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      const result = await generateSummary(minimalInput);

      expect(result).toBe(minimalSummary);
    });

    it('should include all context in prompt', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await generateSummary(fullInput);

      const call = mockCreate.mock.calls[0][0];
      const userMessage = call.messages.find((m: any) => m.role === 'user');

      // Verify all context is included
      expect(userMessage.content).toContain('Junior Data Analyst');
      expect(userMessage.content).toContain('Technology');
      expect(userMessage.content).toContain('Computer Science');
      expect(userMessage.content).toContain('Massachusetts Institute of Technology');
      expect(userMessage.content).toContain('Data Analysis Intern');
      expect(userMessage.content).toContain('Google');
      expect(userMessage.content).toContain('Sales Dashboard');
      expect(userMessage.content).toContain('Python');
      expect(userMessage.content).toContain('SQL');
    });

    it('should limit projects to top 3', async () => {
      const inputWithManyProjects: SummaryGenerationInput = {
        ...fullInput,
        projects: [
          { name: 'Project 1' },
          { name: 'Project 2' },
          { name: 'Project 3' },
          { name: 'Project 4' },
          { name: 'Project 5' },
        ],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await generateSummary(inputWithManyProjects);

      const call = mockCreate.mock.calls[0][0];
      const userMessage = call.messages.find((m: any) => m.role === 'user');

      // Should include first 3 projects
      expect(userMessage.content).toContain('Project 1');
      expect(userMessage.content).toContain('Project 2');
      expect(userMessage.content).toContain('Project 3');

      // Should NOT include 4th and 5th
      expect(userMessage.content).not.toContain('Project 4');
      expect(userMessage.content).not.toContain('Project 5');
    });

    it('should limit skills to top 10', async () => {
      const inputWithManySkills: SummaryGenerationInput = {
        ...fullInput,
        skills: {
          technical: [
            {
              category: 'Category 1',
              items: ['Skill1', 'Skill2', 'Skill3', 'Skill4', 'Skill5'],
            },
            {
              category: 'Category 2',
              items: ['Skill6', 'Skill7', 'Skill8', 'Skill9', 'Skill10'],
            },
            {
              category: 'Category 3',
              items: ['Skill11', 'Skill12', 'Skill13', 'Skill14', 'Skill15'],
            },
            {
              category: 'Category 4',
              items: ['Skill16', 'Skill17'], // Should be truncated (after 10)
            },
          ],
        },
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await generateSummary(inputWithManySkills);

      const call = mockCreate.mock.calls[0][0];
      const userMessage = call.messages.find((m: any) => m.role === 'user');

      // Should include first 3 from each category, then limit to 10 total
      // Cat1: Skill1-3, Cat2: Skill6-8, Cat3: Skill11-13, Cat4: Skill16 (10th item)
      expect(userMessage.content).toContain('Skill1');
      expect(userMessage.content).toContain('Skill3'); // Last from Cat1
      expect(userMessage.content).toContain('Skill8'); // Last from Cat2
      expect(userMessage.content).toContain('Skill16'); // 10th item (first from Cat4)

      // Skills beyond 10 should be truncated
      expect(userMessage.content).not.toContain('Skill17'); // 11th item

      // Skills 4-5 from Cat1 and 9-10 from Cat2 never taken (only first 3 per category)
      expect(userMessage.content).not.toContain('Skill4');
      expect(userMessage.content).not.toContain('Skill9');
    });

    it('should throw error if OpenAI returns no content', async () => {
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

      await expect(generateSummary(fullInput)).rejects.toThrow(
        'No response from AI'
      );
    });

    it('should throw error if summary is too short', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Too short.',
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await expect(generateSummary(fullInput)).rejects.toThrow(
        'Generated summary is too short'
      );
    });

    it('should throw error if summary is too long', async () => {
      const longSummary = 'x'.repeat(600);

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: longSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await expect(generateSummary(fullInput)).rejects.toThrow(
        'Generated summary is too long'
      );
    });

    it('should trim whitespace from summary', async () => {
      const summaryWithWhitespace = `\n\n  ${mockSummary}  \n\n`;

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: summaryWithWhitespace,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      const result = await generateSummary(fullInput);

      expect(result).toBe(mockSummary); // Trimmed
      expect(result).not.toContain('\n\n');
    });

    it('should handle missing optional fields gracefully', async () => {
      const inputWithoutOptionals: SummaryGenerationInput = {
        targetRole: 'Software Developer',
        targetCountry: 'United Kingdom',
        // No industry, education, experience, projects, or skills
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockSummary,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await expect(generateSummary(inputWithoutOptionals)).resolves.toBe(
        mockSummary
      );
    });
  });
});
