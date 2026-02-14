import { analyzeResume, AnalyzeResumeInput, AnalyzeResumeResult } from '../resumeAnalyzer';

// Mock the OpenAI module
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

import openai from '../../../config/openai';

const mockCreate = openai.chat.completions.create as jest.Mock;

const sampleInput: AnalyzeResumeInput = {
  resumeText: 'John Doe\nSoftware Engineer\n3 years experience with React and Node.js',
  targetRole: 'Frontend Developer',
  targetCountry: 'United States',
};

const mockAiResponse: AnalyzeResumeResult = {
  matchPercentage: 75,
  aiAnalysis: {
    strengths: ['Strong React experience', 'Full-stack knowledge'],
    weaknesses: ['No TypeScript mentioned', 'Limited design skills'],
    suggestions: ['Add TypeScript projects', 'Include portfolio link'],
  },
};

describe('Resume Analyzer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return analysis with strengths, weaknesses, suggestions and match percentage', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAiResponse),
          },
        },
      ],
    });

    const result = await analyzeResume(sampleInput);

    expect(result.matchPercentage).toBe(75);
    expect(result.aiAnalysis.strengths).toHaveLength(2);
    expect(result.aiAnalysis.weaknesses).toHaveLength(2);
    expect(result.aiAnalysis.suggestions).toHaveLength(2);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should pass the correct parameters to OpenAI', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAiResponse),
          },
        },
      ],
    });

    await analyzeResume({
      ...sampleInput,
      targetCity: 'San Francisco',
    });

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o-mini');
    // Check that the prompt includes relevant info
    const userMessage = callArgs.messages.find(
      (m: any) => m.role === 'user'
    );
    expect(userMessage.content).toContain('Frontend Developer');
    expect(userMessage.content).toContain('United States');
    expect(userMessage.content).toContain('San Francisco');
    expect(userMessage.content).toContain('John Doe');
  });

  it('should handle OpenAI API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

    await expect(analyzeResume(sampleInput)).rejects.toThrow(
      'API rate limit exceeded'
    );
  });

  it('should throw on empty resume text', async () => {
    await expect(
      analyzeResume({ ...sampleInput, resumeText: '' })
    ).rejects.toThrow('Resume text is required');
  });

  it('should throw on empty target role', async () => {
    await expect(
      analyzeResume({ ...sampleInput, targetRole: '' })
    ).rejects.toThrow('Target role is required');
  });

  it('should throw on empty target country', async () => {
    await expect(
      analyzeResume({ ...sampleInput, targetCountry: '' })
    ).rejects.toThrow('Target country is required');
  });

  it('should handle malformed AI response', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'this is not valid JSON',
          },
        },
      ],
    });

    await expect(analyzeResume(sampleInput)).rejects.toThrow();
  });
});
