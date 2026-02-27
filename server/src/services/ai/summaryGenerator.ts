import openai from '../../config/openai';

/**
 * Resume form data subset for summary generation
 * Includes only fields needed for context
 */
export interface SummaryGenerationInput {
  targetRole: string;
  targetIndustry?: string;
  targetCountry: string;
  education?: Array<{
    degree: string;
    field: string;
    institution: string;
  }>;
  experience?: Array<{
    position: string;
    company: string;
    type: string;
  }>;
  projects?: Array<{
    name: string;
  }>;
  skills?: {
    technical?: Array<{
      category: string;
      items: string[];
    }>;
  };
}

/**
 * Extract relevant context from form data for summary generation
 *
 * @param input - Partial resume form data
 * @returns Formatted context string for AI prompt
 */
function extractContext(input: SummaryGenerationInput): string {
  const lines: string[] = [];

  // Target role and location
  lines.push(`Target Position: ${input.targetRole}`);
  if (input.targetIndustry) {
    lines.push(`Industry: ${input.targetIndustry}`);
  }
  lines.push(`Location: ${input.targetCountry}`);

  // Education (condensed)
  if (input.education && input.education.length > 0) {
    lines.push('\nEducation:');
    input.education.forEach((edu) => {
      lines.push(`- ${edu.degree} in ${edu.field}, ${edu.institution}`);
    });
  }

  // Experience (condensed - titles and companies only)
  if (input.experience && input.experience.length > 0) {
    lines.push('\nExperience:');
    input.experience.forEach((exp) => {
      lines.push(`- ${exp.position} at ${exp.company} (${exp.type})`);
    });
  }

  // Projects (names only)
  if (input.projects && input.projects.length > 0) {
    lines.push('\nProjects:');
    input.projects
      .slice(0, 3)
      .forEach((proj) => {
        lines.push(`- ${proj.name}`);
      });
  }

  // Top skills (up to 5 per category)
  if (input.skills?.technical && input.skills.technical.length > 0) {
    lines.push('\nKey Skills:');
    const allSkills: string[] = [];
    input.skills.technical.forEach((category) => {
      allSkills.push(...category.items.slice(0, 3));
    });
    lines.push(`- ${allSkills.slice(0, 10).join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Generate professional summary using OpenAI
 *
 * Creates a 2-3 sentence summary tailored to the target role,
 * highlighting education, experience, skills, and career goals.
 *
 * @param input - Resume data for context (education, experience, skills, projects)
 * @returns Professional summary string (2-3 sentences)
 * @throws Error if OpenAI API fails or returns invalid data
 *
 * @example
 * ```typescript
 * const summary = await generateSummary({
 *   targetRole: "Junior Data Analyst",
 *   targetIndustry: "Technology",
 *   targetCountry: "United States",
 *   education: [
 *     { degree: "B.S.", field: "Computer Science", institution: "MIT" }
 *   ],
 *   experience: [
 *     { position: "Data Intern", company: "Google", type: "internship" }
 *   ],
 *   skills: {
 *     technical: [
 *       { category: "Programming", items: ["Python", "SQL", "R"] }
 *     ]
 *   }
 * });
 * // Returns: "Recent Computer Science graduate from MIT with hands-on experience
 * // as a Data Intern at Google. Proficient in Python, SQL, and R with demonstrated
 * // ability to analyze complex datasets. Seeking Junior Data Analyst position to
 * // leverage analytical skills in the Technology industry."
 * ```
 */
export async function generateSummary(
  input: SummaryGenerationInput
): Promise<string> {
  // Validation
  if (!input.targetRole?.trim()) {
    throw new Error('Target role is required');
  }

  if (!input.targetCountry?.trim()) {
    throw new Error('Target country is required');
  }

  const context = extractContext(input);

  const prompt = `Generate a professional summary for a fresh graduate's resume.

Candidate Information:
${context}

Requirements:
1. Write 2-3 sentences (100-150 words maximum)
2. First sentence: Highlight education and key qualifications
3. Second sentence: Emphasize relevant experience and skills
4. Third sentence (optional): State career goals aligned with target role
5. Use professional, ATS-friendly language
6. Focus on strengths and value proposition
7. Avoid clichés like "hard-working" or "team player"
8. Start with education level (e.g., "Recent Computer Science graduate...")
9. Include specific skills or achievements when possible

Respond with ONLY the summary text, no formatting or additional commentary.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert resume writer specializing in professional summaries for fresh graduates. Write concise, ATS-optimized summaries that highlight education, skills, and career goals.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4, // Slightly higher for more natural language
    max_tokens: 300, // Limit response length
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const summary = content.trim();

  // Validate summary length (should be 2-3 sentences)
  if (summary.length < 50) {
    throw new Error('Generated summary is too short');
  }

  return summary;
}
