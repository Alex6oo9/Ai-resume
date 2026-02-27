import openai from '../../config/openai';
import { sanitizePromptInput } from '../../utils/sanitizePromptInput';

export interface ExtractStructureInput {
  resumeText: string;
  targetRole?: string;
}

export interface ExtractedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  targetRole?: string;
  targetCountry?: string;
  targetCity?: string;
  targetIndustry?: string;
  education?: Array<{
    degreeType: string;
    major: string;
    university: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework: string;
    honors?: string;
  }>;
  experience?: Array<{
    type: string;
    company: string;
    role: string;
    duration: string;
    responsibilities: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    role: string;
  }>;
  skills?: {
    technical: Array<{ category: string; items: string[] }>;
    soft: string[];
    languages: Array<{ language: string; proficiency: string }>;
  };
  professionalSummary?: string;
}

export async function extractResumeStructure(
  input: ExtractStructureInput
): Promise<ExtractedResumeData> {
  const { resumeText, targetRole } = input;

  const sanitizedText = sanitizePromptInput(resumeText);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume parser. Extract structured data from the resume text into JSON matching this exact schema. Use empty strings or empty arrays for missing fields. Never omit required keys.

JSON schema:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "city": string,
  "country": string,
  "professionalSummary": string,
  "education": [{"degreeType": string, "major": string, "university": string, "graduationDate": string, "gpa": string, "relevantCoursework": string, "honors": string}],
  "experience": [{"type": "full-time"|"internship"|"part-time"|"freelance"|"volunteer", "company": string, "role": string, "duration": string, "responsibilities": string}],
  "projects": [{"name": string, "description": string, "technologies": string, "role": string}],
  "skills": {
    "technical": [{"category": string, "items": [string]}],
    "soft": [string],
    "languages": [{"language": string, "proficiency": "native"|"fluent"|"professional"|"intermediate"|"basic"}]
  }
}

Respond with ONLY valid JSON.`,
      },
      {
        role: 'user',
        content: `Extract structured data from this resume${targetRole ? ` (target role: ${targetRole})` : ''}:\n\n${sanitizedText}`,
      },
    ],
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content) as ExtractedResumeData;
}
