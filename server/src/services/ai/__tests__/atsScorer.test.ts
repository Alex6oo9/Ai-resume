import { calculateAtsScore, AtsScoreInput, AtsScoreBreakdown } from '../atsScorer';

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

const sampleInput: AtsScoreInput = {
  resumeText: 'John Doe\nSoftware Engineer\n3 years experience with React and Node.js',
  targetRole: 'Frontend Developer',
};

const mockAtsResponse: AtsScoreBreakdown = {
  formatCompliance: 35,
  keywordMatch: 30,
  sectionCompleteness: 18,
  totalScore: 83,
  keywords: {
    matched: ['React', 'JavaScript', 'Node.js'],
    missing: ['TypeScript', 'CSS', 'Testing'],
  },
};

describe('ATS Scorer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a valid ATS score breakdown', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockAtsResponse) } }],
    });

    const result = await calculateAtsScore(sampleInput);

    expect(result.totalScore).toBe(83);
    expect(result.formatCompliance).toBe(35);
    expect(result.keywordMatch).toBe(30);
    expect(result.sectionCompleteness).toBe(18);
    expect(result.keywords.matched).toHaveLength(3);
    expect(result.keywords.missing).toHaveLength(3);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should pass correct parameters to OpenAI', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockAtsResponse) } }],
    });

    await calculateAtsScore(sampleInput);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o-mini');
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMessage.content).toContain('Frontend Developer');
    expect(userMessage.content).toContain('John Doe');
  });

  it('should throw on empty resume text', async () => {
    await expect(
      calculateAtsScore({ ...sampleInput, resumeText: '' })
    ).rejects.toThrow('Resume text is required');
  });

  it('should throw on whitespace-only resume text', async () => {
    await expect(
      calculateAtsScore({ ...sampleInput, resumeText: '   ' })
    ).rejects.toThrow('Resume text is required');
  });

  it('should throw on empty target role', async () => {
    await expect(
      calculateAtsScore({ ...sampleInput, targetRole: '' })
    ).rejects.toThrow('Target role is required');
  });

  it('should handle OpenAI API errors', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

    await expect(calculateAtsScore(sampleInput)).rejects.toThrow(
      'API rate limit exceeded'
    );
  });

  it('should handle malformed JSON response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not valid json' } }],
    });

    await expect(calculateAtsScore(sampleInput)).rejects.toThrow();
  });

  it('should handle empty AI response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    await expect(calculateAtsScore(sampleInput)).rejects.toThrow(
      'No response from AI'
    );
  });
});
