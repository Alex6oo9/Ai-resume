import openai from '../../config/openai';
import { sanitizePromptInput } from '../../utils/sanitizePromptInput';
import type { CoverLetterTone, CoverLetterLength } from '../../types/coverLetter.types';

const WORD_COUNT_MAP: Record<CoverLetterLength, number> = {
  short: 150,
  medium: 250,
  long: 400,
};

interface GenerateCoverLetterParams {
  resumeText: string;
  fullName: string;
  targetRole: string;
  targetLocation: string;
  jobDescription: string | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  tone: CoverLetterTone;
  wordCountTarget: CoverLetterLength;
  companyName: string;
  hiringManagerName: string | null;
  customInstructions: string | null;
}

export async function generateCoverLetter(params: GenerateCoverLetterParams): Promise<string> {
  const {
    resumeText,
    fullName,
    targetRole,
    targetLocation,
    jobDescription,
    matchedKeywords,
    missingKeywords,
    tone,
    wordCountTarget,
    companyName,
    hiringManagerName,
    customInstructions,
  } = params;

  const sanitizedJd = jobDescription ? sanitizePromptInput(jobDescription).slice(0, 2000) : 'Not provided';
  const sanitizedInstructions = customInstructions ? sanitizePromptInput(customInstructions) : null;
  const truncatedResumeText = resumeText.slice(0, 3000);
  const wordCount = WORD_COUNT_MAP[wordCountTarget];

  const userMessage = `Write a cover letter for the following candidate.

CANDIDATE NAME: ${fullName}
TARGET ROLE: ${targetRole}
LOCATION: ${targetLocation}
COMPANY: ${companyName}
HIRING MANAGER: ${hiringManagerName || 'Hiring Manager'}

CANDIDATE RESUME SUMMARY:
${truncatedResumeText}

JOB DESCRIPTION:
${sanitizedJd}

KEYWORDS ALREADY IN RESUME (naturally reference these): ${matchedKeywords.join(', ') || 'None'}
KEYWORDS MISSING FROM RESUME (weave these in naturally where truthful): ${missingKeywords.join(', ') || 'None'}

TONE: ${tone}
- professional: confident, polished, industry-standard language
- enthusiastic: energetic and passionate while remaining professional
- formal: conservative, no contractions, suitable for finance/law/government
- conversational: warm and approachable, contractions OK, suitable for startups

TARGET LENGTH: approximately ${wordCount} words

ADDITIONAL INSTRUCTIONS: ${sanitizedInstructions || 'None'}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content: `You are an expert cover letter writer for fresh graduates applying to junior roles.
Write in first person. Be specific and concise. Avoid generic openers like "I am writing to apply for". Never use filler phrases like "I am passionate about" without concrete evidence. Match the tone requested by the user.
Output ONLY the cover letter text — no subject line, no metadata, no commentary.`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return content;
}
