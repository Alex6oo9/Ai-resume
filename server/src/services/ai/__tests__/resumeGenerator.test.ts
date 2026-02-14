import { generateResume, GenerateResumeResult } from '../resumeGenerator';

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

const sampleFormData = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+1-555-0100',
  city: 'San Francisco',
  country: 'United States',
  targetRole: 'Frontend Developer',
  targetCountry: 'United States',
  targetCity: 'San Francisco',
  education: [
    {
      degreeType: 'Bachelor of Science',
      major: 'Computer Science',
      university: 'Stanford University',
      graduationDate: '2024-06',
      gpa: '3.8',
      relevantCoursework: 'Data Structures, Web Development, Algorithms',
      honors: 'Cum Laude',
    },
  ],
  experience: [
    {
      type: 'internship' as const,
      company: 'Tech Corp',
      role: 'Frontend Intern',
      duration: 'Jun 2023 - Aug 2023',
      responsibilities: 'Built React components, improved page load by 30%',
    },
  ],
  projects: [
    {
      name: 'Portfolio Website',
      description: 'Personal portfolio built with React and TypeScript',
      technologies: 'React, TypeScript, TailwindCSS',
      role: 'Solo Developer',
      link: 'https://github.com/jane/portfolio',
    },
  ],
  technicalSkills: 'React, TypeScript, JavaScript, HTML, CSS, Git',
  softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
  languages: [
    { name: 'English', proficiency: 'native' as const },
    { name: 'Spanish', proficiency: 'intermediate' as const },
  ],
  professionalSummary:
    'Motivated CS graduate seeking frontend developer roles.',
};

const mockAiResponse: GenerateResumeResult = {
  resumeText:
    'JANE SMITH\njane@example.com | +1-555-0100\n\nPROFESSIONAL SUMMARY\nMotivated CS graduate...\n\nEDUCATION\nStanford University\nBachelor of Science in Computer Science\n\nEXPERIENCE\nFrontend Intern at Tech Corp\n\nPROJECTS\nPortfolio Website\n\nSKILLS\nReact, TypeScript, JavaScript',
  matchPercentage: 82,
  aiAnalysis: {
    strengths: ['Relevant internship experience', 'Strong technical skills'],
    weaknesses: ['Limited professional experience'],
    suggestions: ['Add more quantified achievements'],
  },
};

describe('Resume Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate resume text, match percentage, and analysis from form data', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAiResponse),
          },
        },
      ],
    });

    const result = await generateResume(sampleFormData);

    expect(result.resumeText).toContain('JANE SMITH');
    expect(result.matchPercentage).toBe(82);
    expect(result.aiAnalysis.strengths).toHaveLength(2);
    expect(result.aiAnalysis.weaknesses).toHaveLength(1);
    expect(result.aiAnalysis.suggestions).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should pass form data details in the prompt', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockAiResponse) } }],
    });

    await generateResume(sampleFormData);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o-mini');
    const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
    expect(userMessage.content).toContain('Jane Smith');
    expect(userMessage.content).toContain('Frontend Developer');
    expect(userMessage.content).toContain('Stanford University');
    expect(userMessage.content).toContain('React');
  });

  it('should throw on missing required fields', async () => {
    await expect(
      generateResume({ ...sampleFormData, fullName: '' })
    ).rejects.toThrow('Full name is required');

    await expect(
      generateResume({ ...sampleFormData, targetRole: '' })
    ).rejects.toThrow('Target role is required');

    await expect(
      generateResume({ ...sampleFormData, targetCountry: '' })
    ).rejects.toThrow('Target country is required');
  });

  it('should handle OpenAI API errors', async () => {
    mockCreate.mockRejectedValue(new Error('API quota exceeded'));

    await expect(generateResume(sampleFormData)).rejects.toThrow(
      'API quota exceeded'
    );
  });

  it('should handle malformed AI response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not json' } }],
    });

    await expect(generateResume(sampleFormData)).rejects.toThrow();
  });
});
