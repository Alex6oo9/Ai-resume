import openai from '../../config/openai';
import pool from '../../config/db';

/**
 * Skills generation result structure
 */
export interface GeneratedSkills {
  technical: Array<{
    category: string;
    items: string[];
  }>;
  soft: string[];
  languages: Array<{
    language: string;
    proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
  }>;
}

/**
 * Cache configuration
 */
const CACHE_EXPIRATION_DAYS = 30;

/**
 * Generate cache key for skills generation
 *
 * @param targetRole - Target job role (e.g., "Junior Data Analyst")
 * @param targetIndustry - Target industry (e.g., "Technology")
 * @returns Cache key string
 */
function getCacheKey(targetRole: string, targetIndustry: string): string {
  return `skills_v2:${targetRole.toLowerCase().trim()}:${targetIndustry.toLowerCase().trim()}`;
}

/**
 * Retrieve skills from cache
 *
 * @param cacheKey - Cache key to lookup
 * @returns Cached skills or null if not found/expired
 */
async function getFromCache(cacheKey: string): Promise<GeneratedSkills | null> {
  try {
    const result = await pool.query(
      'SELECT cache_value FROM ai_cache WHERE cache_key = $1 AND expires_at > NOW()',
      [cacheKey]
    );

    if (result.rows.length > 0) {
      return result.rows[0].cache_value as GeneratedSkills;
    }

    return null;
  } catch (err) {
    console.error('Cache retrieval error:', err);
    return null; // Graceful degradation - proceed without cache
  }
}

/**
 * Store skills in cache
 *
 * @param cacheKey - Cache key
 * @param skills - Generated skills to cache
 */
async function storeInCache(
  cacheKey: string,
  skills: GeneratedSkills
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO ai_cache (cache_key, cache_value, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '${CACHE_EXPIRATION_DAYS} days')
       ON CONFLICT (cache_key)
       DO UPDATE SET
         cache_value = $2,
         created_at = NOW(),
         expires_at = NOW() + INTERVAL '${CACHE_EXPIRATION_DAYS} days'`,
      [cacheKey, JSON.stringify(skills)]
    );
  } catch (err) {
    console.error('Cache storage error:', err);
    // Don't throw - caching failure shouldn't break the request
  }
}

/**
 * Generate skills using OpenAI API
 *
 * @param targetRole - Target job role
 * @param targetIndustry - Target industry
 * @returns Generated skills from AI
 */
async function generateSkillsFromAI(
  targetRole: string,
  targetIndustry?: string
): Promise<GeneratedSkills> {
  const industryContext = targetIndustry?.trim() ? ` in the ${targetIndustry} industry` : '';
  const prompt = `Generate a focused technical skills list for a fresh graduate applying for a "${targetRole}" position${industryContext}.

Requirements:
1. Technical Skills: Provide 2-3 categories with exactly 4-5 highly relevant skills each (max 15 total)
   - Categories must be specific to ${targetRole}
   - Skills should be concrete tools, technologies, or methodologies
   - Be specific (e.g., "Excel" not "Office Software")
   - Prioritize the most in-demand skills for this role

2. Soft Skills: Provide 2-3 soft skills that are SPECIFICALLY valued for ${targetRole}${industryContext}
   - EXCLUDE these already-covered skills: Communication, Teamwork, Problem Solving, Leadership,
     Time Management, Adaptability, Critical Thinking, Creativity, Analytical Thinking, Attention to Detail
   - Only include role-specific soft skills not in the exclusion list above

3. Languages: Suggest 1 common language for this role (usually English)

Respond with ONLY valid JSON in this exact format:
{
  "technical": [
    {"category": "Category Name", "items": ["skill1", "skill2", "skill3", "skill4"]},
    {"category": "Another Category", "items": ["skill1", "skill2", "skill3"]}
  ],
  "soft": ["Role-specific soft skill not in exclusion list"],
  "languages": [
    {"language": "English", "proficiency": "fluent"}
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert career advisor specializing in resume optimization for fresh graduates. Respond only with valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3, // Lower temperature for more consistent results
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const skills = JSON.parse(content) as GeneratedSkills;

  // Validate response structure
  if (
    !skills.technical ||
    !Array.isArray(skills.technical) ||
    !skills.soft ||
    !Array.isArray(skills.soft) ||
    !skills.languages ||
    !Array.isArray(skills.languages)
  ) {
    throw new Error('Invalid response structure from AI');
  }

  return skills;
}

/**
 * Generate skills for a target role and industry
 *
 * Uses PostgreSQL caching to reduce OpenAI API costs.
 * Cache expires after 30 days.
 *
 * @param targetRole - Target job role (e.g., "Junior Data Analyst")
 * @param targetIndustry - Target industry (e.g., "Technology", "Marketing")
 * @returns Generated skills object with technical, soft, and language skills
 * @throws Error if OpenAI API fails or returns invalid data
 *
 * @example
 * ```typescript
 * const skills = await generateSkills("Junior Data Analyst", "Technology");
 * // Returns:
 * // {
 * //   technical: [
 * //     { category: "Programming Languages", items: ["Python", "SQL", "R"] },
 * //     { category: "Data Visualization", items: ["Tableau", "Power BI"] }
 * //   ],
 * //   soft: ["Analytical Thinking", "Communication", ...],
 * //   languages: [{ language: "English", proficiency: "fluent" }]
 * // }
 * ```
 */
export async function generateSkills(
  targetRole: string,
  targetIndustry?: string
): Promise<GeneratedSkills> {
  if (!targetRole?.trim()) {
    throw new Error('Target role is required');
  }

  // Check cache first
  const cacheKey = getCacheKey(targetRole, targetIndustry ?? '');
  const cachedSkills = await getFromCache(cacheKey);

  if (cachedSkills) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cachedSkills;
  }

  console.log(`Cache miss for: ${cacheKey}, generating with AI...`);

  // Generate with AI
  const skills = await generateSkillsFromAI(targetRole, targetIndustry);

  // Store in cache (fire and forget)
  storeInCache(cacheKey, skills).catch((err) =>
    console.error('Failed to cache skills:', err)
  );

  return skills;
}
