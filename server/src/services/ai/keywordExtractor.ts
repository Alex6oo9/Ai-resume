import openai from '../../config/openai';
import { sanitizePromptInput } from '../../utils/sanitizePromptInput';

export async function extractKeywords({
  resumeText,
  jobDescription,
}: {
  resumeText: string;
  jobDescription: string;
}): Promise<{ matchedKeywords: string[]; missingKeywords: string[] }> {
  const sanitizedResume = sanitizePromptInput(resumeText).slice(0, 3000);
  const sanitizedJd = sanitizePromptInput(jobDescription).slice(0, 2000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a keyword extraction assistant. Given a resume and job description, identify which keywords from the job description are already present in the resume (matchedKeywords) and which are missing (missingKeywords). Return a JSON object with exactly two arrays: "matchedKeywords" and "missingKeywords". Each keyword should be a short phrase (1-3 words). Return at most 10 matched and 10 missing keywords.`,
      },
      {
        role: 'user',
        content: `RESUME:\n${sanitizedResume}\n\nJOB DESCRIPTION:\n${sanitizedJd}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed = JSON.parse(content);
  return {
    matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
  };
}
