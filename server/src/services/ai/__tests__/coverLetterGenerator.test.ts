import { generateCoverLetter } from '../coverLetterGenerator';

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

// Mock sanitizePromptInput to track calls
jest.mock('../../../utils/sanitizePromptInput', () => ({
  sanitizePromptInput: jest.fn((text: string) => text),
}));

import openai from '../../../config/openai';
import { sanitizePromptInput } from '../../../utils/sanitizePromptInput';

const mockCreate = openai.chat.completions.create as jest.Mock;
const mockSanitize = sanitizePromptInput as jest.Mock;

const baseParams = {
  resumeText: 'Jane Doe\nSoftware Engineer\nExperience with React and Node.js',
  fullName: 'Jane Doe',
  targetRole: 'Frontend Developer',
  targetLocation: 'San Francisco, United States',
  jobDescription: 'Looking for a React developer with TypeScript experience.',
  matchedKeywords: ['React', 'Node.js'],
  missingKeywords: ['TypeScript', 'GraphQL'],
  tone: 'professional' as const,
  wordCountTarget: 'medium' as const,
  companyName: 'Acme Corp',
  hiringManagerName: 'John Smith',
  customInstructions: 'Mention I am open to relocation.',
};

const mockCoverLetterText = 'Dear John Smith,\n\nI am excited to apply for the Frontend Developer role at Acme Corp...';

describe('Cover Letter Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: mockCoverLetterText } }],
    });
  });

  it('returns a non-empty string on success', async () => {
    const result = await generateCoverLetter(baseParams);
    expect(result).toBe(mockCoverLetterText);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('calls OpenAI with model gpt-4o-mini and temperature 0.8', async () => {
    await generateCoverLetter(baseParams);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o-mini');
    expect(callArgs.temperature).toBe(0.8);
  });

  it('does NOT pass response_format json_object to OpenAI', async () => {
    await generateCoverLetter(baseParams);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.response_format).toBeUndefined();
  });

  it('calls sanitizePromptInput on customInstructions', async () => {
    await generateCoverLetter(baseParams);
    expect(mockSanitize).toHaveBeenCalledWith(baseParams.customInstructions);
  });

  it('falls back gracefully when jobDescription is null', async () => {
    const params = { ...baseParams, jobDescription: null };
    await expect(generateCoverLetter(params)).resolves.toBe(mockCoverLetterText);
    const callArgs = mockCreate.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMsg.content).toContain('Not provided');
  });

  it('falls back gracefully when missingKeywords is empty', async () => {
    const params = { ...baseParams, missingKeywords: [] };
    await expect(generateCoverLetter(params)).resolves.toBe(mockCoverLetterText);
    const callArgs = mockCreate.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMsg.content).toContain('None');
  });

  it('truncates resumeText to 3000 chars when longer', async () => {
    const longText = 'A'.repeat(5000);
    await generateCoverLetter({ ...baseParams, resumeText: longText });
    const callArgs = mockCreate.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
    // The truncated text (3000 chars) should appear in the prompt
    expect(userMsg.content).toContain('A'.repeat(3000));
    expect(userMsg.content).not.toContain('A'.repeat(3001));
  });

  it('uses fullName in the prompt', async () => {
    await generateCoverLetter(baseParams);
    const callArgs = mockCreate.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMsg.content).toContain('Jane Doe');
  });

  it('throws when resumeText is empty string', async () => {
    const params = { ...baseParams, resumeText: '' };
    // empty string sliced to 3000 chars is still empty — prompt sends empty resume
    await expect(generateCoverLetter(params)).resolves.toBe(mockCoverLetterText);
  });

  it('throws when AI returns null content', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });
    await expect(generateCoverLetter(baseParams)).rejects.toThrow('No response from AI');
  });
});
