import { analyzeImprovements, ImprovementInput, DetailedImprovements } from '../improvementAnalyzer';

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

const sampleInput: ImprovementInput = {
  resumeText: 'John Doe\nSoftware Engineer\n3 years experience with React and Node.js',
  targetRole: 'Frontend Developer',
};

const mockImprovements: DetailedImprovements = {
  actionVerbs: [
    { current: 'worked on React projects', suggested: 'Engineered scalable React applications' },
  ],
  quantifiedAchievements: [
    { suggestion: 'Add metrics to your React experience, e.g., "Improved page load time by 40%"' },
  ],
  missingSections: ['Professional Summary', 'Certifications'],
  keywordOptimization: [
    { keyword: 'TypeScript', reason: 'Highly sought for Frontend Developer roles' },
  ],
  formattingIssues: [
    'Add clear section headers for Education, Experience, and Skills',
  ],
};

describe('Improvement Analyzer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return categorized improvements', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockImprovements) } }],
    });

    const result = await analyzeImprovements(sampleInput);

    expect(result.actionVerbs).toHaveLength(1);
    expect(result.quantifiedAchievements).toHaveLength(1);
    expect(result.missingSections).toHaveLength(2);
    expect(result.keywordOptimization).toHaveLength(1);
    expect(result.formattingIssues).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should pass correct parameters to OpenAI', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockImprovements) } }],
    });

    await analyzeImprovements(sampleInput);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o-mini');
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMessage.content).toContain('Frontend Developer');
    expect(userMessage.content).toContain('John Doe');
  });

  it('should throw on empty resume text', async () => {
    await expect(
      analyzeImprovements({ ...sampleInput, resumeText: '' })
    ).rejects.toThrow('Resume text is required');
  });

  it('should throw on empty target role', async () => {
    await expect(
      analyzeImprovements({ ...sampleInput, targetRole: '' })
    ).rejects.toThrow('Target role is required');
  });

  it('should handle OpenAI API errors', async () => {
    mockCreate.mockRejectedValue(new Error('Service unavailable'));

    await expect(analyzeImprovements(sampleInput)).rejects.toThrow(
      'Service unavailable'
    );
  });

  it('should handle malformed JSON response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'invalid json here' } }],
    });

    await expect(analyzeImprovements(sampleInput)).rejects.toThrow();
  });

  it('should handle empty AI response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    await expect(analyzeImprovements(sampleInput)).rejects.toThrow(
      'No response from AI'
    );
  });
});
