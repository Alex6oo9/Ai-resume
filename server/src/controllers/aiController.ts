import { Request, Response, NextFunction } from 'express';
import { generateSkills } from '../services/ai/skillsGenerator';
import { generateSummary } from '../services/ai/summaryGenerator';

/**
 * Generate skills for a target role and industry
 *
 * POST /api/ai/generate-skills
 *
 * Request body:
 * {
 *   targetRole: string,
 *   targetIndustry: string
 * }
 *
 * Response:
 * {
 *   technical: [...],
 *   soft: [...],
 *   languages: [...]
 * }
 */
export const generateSkillsEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRole, targetIndustry } = req.body;

    // Validation
    if (!targetRole || typeof targetRole !== 'string') {
      res.status(400).json({ error: 'Target role is required and must be a string' });
      return;
    }

    if (!targetIndustry || typeof targetIndustry !== 'string') {
      res.status(400).json({ error: 'Target industry is required and must be a string' });
      return;
    }

    // Generate skills
    const skills = await generateSkills(
      targetRole.trim(),
      targetIndustry.trim()
    );

    res.status(200).json(skills);
  } catch (err) {
    next(err);
  }
};

/**
 * Generate professional summary
 *
 * POST /api/ai/generate-summary
 *
 * Request body:
 * {
 *   targetRole: string,
 *   targetCountry: string,
 *   targetIndustry?: string,
 *   education?: [...],
 *   experience?: [...],
 *   projects?: [...],
 *   skills?: { technical: [...] }
 * }
 *
 * Response:
 * {
 *   summary: string
 * }
 */
export const generateSummaryEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      targetRole,
      targetCountry,
      targetIndustry,
      education,
      experience,
      projects,
      skills,
    } = req.body;

    // Validation
    if (!targetRole || typeof targetRole !== 'string') {
      res.status(400).json({ error: 'Target role is required and must be a string' });
      return;
    }

    // Generate summary
    const summary = await generateSummary({
      targetRole: targetRole.trim(),
      targetCountry: targetCountry.trim(),
      targetIndustry: targetIndustry?.trim(),
      education,
      experience,
      projects,
      skills,
    });

    res.status(200).json({ summary });
  } catch (err) {
    next(err);
  }
};
