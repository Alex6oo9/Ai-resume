import openai from '../../config/openai';

export interface AnalyzeResumeInput {
  resumeText: string;
  targetRole: string;
  targetCountry: string;
  targetCity?: string;
}

export interface AiAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface AnalyzeResumeResult {
  matchPercentage: number;
  aiAnalysis: AiAnalysis;
}

export async function analyzeResume(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeResult> {
  const { resumeText, targetRole, targetCountry, targetCity } = input;

  if (!resumeText?.trim()) {
    throw new Error('Resume text is required');
  }
  if (!targetRole?.trim()) {
    throw new Error('Target role is required');
  }
  if (!targetCountry?.trim()) {
    throw new Error('Target country is required');
  }

  const locationStr = targetCity
    ? `${targetCity}, ${targetCountry}`
    : targetCountry;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume analyst. Analyze resumes and provide structured feedback as JSON.
You must respond with ONLY valid JSON in this exact format:
{
  "matchPercentage": <number 0-100>,
  "aiAnalysis": {
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
  }
}`,
      },
      {
        role: 'user',
        content: `Analyze this resume for a "${targetRole}" position in ${locationStr}.

Resume:
${resumeText}

Provide:
1. A match percentage (0-100) for how well this resume fits the target role and location
2. Key strengths relevant to the role
3. Weaknesses or gaps
4. Specific actionable suggestions for improvement

Respond with ONLY valid JSON.`,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed = JSON.parse(content) as AnalyzeResumeResult;
  return parsed;
}
