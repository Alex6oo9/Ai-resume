import openai from '../../config/openai';
import { sanitizePromptInput } from '../../utils/sanitizePromptInput';

export interface AtsScoreInput {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
}

export interface AtsScoreBreakdown {
  formatCompliance: number;
  keywordMatch: number;
  sectionCompleteness: number;
  totalScore: number;
  keywords: {
    matched: string[];
    missing: string[];
  };
}

export async function calculateAtsScore(
  input: AtsScoreInput
): Promise<AtsScoreBreakdown> {
  const { resumeText, targetRole, jobDescription } = input;

  if (!resumeText?.trim()) {
    throw new Error('Resume text is required');
  }
  if (!targetRole?.trim()) {
    throw new Error('Target role is required');
  }

  const sanitizedText = sanitizePromptInput(resumeText);
  const sanitizedJd = jobDescription ? sanitizePromptInput(jobDescription) : undefined;

  const keywordInstruction = sanitizedJd
    ? `\nJob Description:\n${sanitizedJd}\n\nFor keywordMatch: score based on actual JD keywords present vs missing in the resume. List exact terms from the JD in matched/missing arrays.`
    : '(Use typical industry keywords for this role)';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert ATS (Applicant Tracking System) analyst. Score resumes for ATS compatibility and provide structured feedback as JSON.
You must respond with ONLY valid JSON in this exact format:
{
  "formatCompliance": <number 0-40>,
  "keywordMatch": <number 0-40>,
  "sectionCompleteness": <number 0-20>,
  "totalScore": <number 0-100>,
  "keywords": {
    "matched": ["keyword1", "keyword2", ...],
    "missing": ["keyword1", "keyword2", ...]
  }
}

Scoring criteria:
- formatCompliance (0-40): Standard formatting, clean sections, no tables/images, proper headings
- keywordMatch (0-40): Relevant industry keywords, skills, and terminology for the target role
- sectionCompleteness (0-20): Presence of all key sections (contact, summary, education, experience, skills)
- totalScore: Sum of the three sub-scores`,
      },
      {
        role: 'user',
        content: `Analyze this resume for ATS compatibility for a "${targetRole}" position.

Resume:
${sanitizedText}
${keywordInstruction}
Score the resume and identify matched and missing keywords. Respond with ONLY valid JSON.`,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed = JSON.parse(content) as AtsScoreBreakdown;
  return parsed;
}
