import openai from '../../config/openai';

export interface ImprovementInput {
  resumeText: string;
  targetRole: string;
}

export interface DetailedImprovements {
  actionVerbs: Array<{ current: string; suggested: string }>;
  quantifiedAchievements: Array<{ suggestion: string }>;
  missingSections: string[];
  keywordOptimization: Array<{ keyword: string; reason: string }>;
  formattingIssues: string[];
}

export async function analyzeImprovements(
  input: ImprovementInput
): Promise<DetailedImprovements> {
  const { resumeText, targetRole } = input;

  if (!resumeText?.trim()) {
    throw new Error('Resume text is required');
  }
  if (!targetRole?.trim()) {
    throw new Error('Target role is required');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume coach. Analyze resumes and provide detailed, categorized improvement suggestions as JSON.
You must respond with ONLY valid JSON in this exact format:
{
  "actionVerbs": [{"current": "weak phrase", "suggested": "stronger alternative"}, ...],
  "quantifiedAchievements": [{"suggestion": "specific suggestion to add metrics"}, ...],
  "missingSections": ["section name", ...],
  "keywordOptimization": [{"keyword": "missing keyword", "reason": "why it matters"}, ...],
  "formattingIssues": ["issue description", ...]
}`,
      },
      {
        role: 'user',
        content: `Analyze this resume for a "${targetRole}" position and provide detailed improvement suggestions.

Resume:
${resumeText}

Provide categorized improvements covering:
1. Weak action verbs that should be replaced with stronger ones
2. Opportunities to add quantified achievements
3. Missing resume sections
4. Keywords to add for ATS optimization
5. Formatting issues to fix

Respond with ONLY valid JSON.`,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed = JSON.parse(content) as DetailedImprovements;
  return parsed;
}
