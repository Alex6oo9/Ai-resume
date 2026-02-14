import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { calculateAtsScore } from '../services/ai/atsScorer';
import { analyzeImprovements } from '../services/ai/improvementAnalyzer';

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

    const detailed = await analyzeImprovements({
      resumeText: resume.parsed_text,
      targetRole: resume.target_role,
    });

    res.json({
      suggestions: aiAnalysis.suggestions || [],
      detailed,
    });
  } catch (err) {
    next(err);
  }
};
