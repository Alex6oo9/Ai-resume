import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { calculateAtsScore } from '../services/ai/atsScorer';
import { analyzeImprovements } from '../services/ai/improvementAnalyzer';
import { analyzeResume } from '../services/ai/resumeAnalyzer';
import { sanitizePromptInput } from '../utils/sanitizePromptInput';

export const getMatchPercentage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId } = req.body;

    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const resume = result.rows[0];
    const aiAnalysis =
      typeof resume.ai_analysis === 'string'
        ? JSON.parse(resume.ai_analysis)
        : resume.ai_analysis || {};

    res.json({
      matchPercentage: resume.match_percentage,
      strengths: aiAnalysis.strengths || [],
      weaknesses: aiAnalysis.weaknesses || [],
      suggestions: aiAnalysis.suggestions || [],
    });
  } catch (err) {
    next(err);
  }
};

export const getAtsScore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId } = req.body;

    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const resume = result.rows[0];
    const aiAnalysis =
      typeof resume.ai_analysis === 'string'
        ? JSON.parse(resume.ai_analysis)
        : resume.ai_analysis || {};

    // Return cached ATS breakdown if available
    if (resume.ats_score !== null && aiAnalysis.atsBreakdown) {
      res.json({ atsBreakdown: aiAnalysis.atsBreakdown });
      return;
    }

    // Compute ATS score
    const atsBreakdown = await calculateAtsScore({
      resumeText: resume.parsed_text,
      targetRole: resume.target_role,
      jobDescription: resume.job_description || undefined,
    });

    // Cache in DB
    const updatedAnalysis = { ...aiAnalysis, atsBreakdown };
    await pool.query(
      'UPDATE resumes SET ats_score = $1, ai_analysis = $2 WHERE id = $3',
      [atsBreakdown.totalScore, JSON.stringify(updatedAnalysis), resumeId]
    );

    res.json({ atsBreakdown });
  } catch (err) {
    next(err);
  }
};

export const getImprovements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId, forceRefresh } = req.body;

    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const resume = result.rows[0];
    const aiAnalysis =
      typeof resume.ai_analysis === 'string'
        ? JSON.parse(resume.ai_analysis)
        : resume.ai_analysis || {};

    // Return cached improvements if available (unless forceRefresh)
    if (aiAnalysis.improvements && !forceRefresh) {
      res.json({
        suggestions: aiAnalysis.suggestions || [],
        detailed: aiAnalysis.improvements,
      });
      return;
    }

    const detailed = await analyzeImprovements({
      resumeText: resume.parsed_text,
      targetRole: resume.target_role,
      jobDescription: resume.job_description || undefined,
    });

    // Cache in DB
    const updatedAnalysis = { ...aiAnalysis, improvements: detailed };
    await pool.query(
      'UPDATE resumes SET ai_analysis = $1 WHERE id = $2',
      [JSON.stringify(updatedAnalysis), resumeId]
    );

    res.json({
      suggestions: aiAnalysis.suggestions || [],
      detailed,
    });
  } catch (err) {
    next(err);
  }
};

export const reanalyze = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId, targetRole, targetCountry, targetCity, jobDescription } = req.body;

    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const resume = result.rows[0];
    const sanitizedJd = jobDescription ? sanitizePromptInput(jobDescription) : null;

    const { matchPercentage, aiAnalysis } = await analyzeResume({
      resumeText: resume.parsed_text,
      targetRole,
      targetCountry: targetCountry || resume.target_country,
      targetCity: targetCity || resume.target_city || undefined,
      jobDescription: sanitizedJd || undefined,
    });

    // Clear cached ATS + improvements by only writing base analysis
    const newAnalysis = {
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      suggestions: aiAnalysis.suggestions,
    };

    await pool.query(
      `UPDATE resumes
       SET target_role = $1, target_country = $2, target_city = $3,
           job_description = $4, match_percentage = $5, ai_analysis = $6,
           ats_score = NULL
       WHERE id = $7`,
      [
        targetRole,
        targetCountry || resume.target_country,
        targetCity || resume.target_city || null,
        sanitizedJd,
        matchPercentage,
        JSON.stringify(newAnalysis),
        resumeId,
      ]
    );

    // Record this analysis run in history
    await pool.query(
      `INSERT INTO analysis_history (resume_id, user_id, target_role, job_description, match_percentage, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        resumeId,
        userId,
        targetRole,
        sanitizedJd,
        matchPercentage,
        JSON.stringify(newAnalysis),
      ]
    );

    res.json({
      matchPercentage,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      suggestions: aiAnalysis.suggestions,
    });
  } catch (err) {
    next(err);
  }
};

export const getAnalysisHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId } = req.params;

    const result = await pool.query(
      `SELECT id, target_role, job_description, match_percentage, ai_analysis, created_at
       FROM analysis_history
       WHERE resume_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 5`,
      [resumeId, userId]
    );

    res.json({ history: result.rows });
  } catch (err) {
    next(err);
  }
};
