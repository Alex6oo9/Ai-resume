import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import pool from '../config/db';
import { extractTextFromPDF } from '../services/parser/pdfParser';
import { analyzeResume } from '../services/ai/resumeAnalyzer';
import { generateResume } from '../services/ai/resumeGenerator';

export const uploadResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const filePath = req.file?.path;
  try {
    if (!req.file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    const userId = (req.user as any).id;
    const { targetRole, targetCountry, targetCity } = req.body;

    // Extract text from PDF
    const parsedText = await extractTextFromPDF(filePath!);

    // Analyze with AI
    const { matchPercentage, aiAnalysis } = await analyzeResume({
      resumeText: parsedText,
      targetRole,
      targetCountry,
      targetCity,
    });

    // Insert into database
    const result = await pool.query(
      `INSERT INTO resumes (user_id, file_path, parsed_text, target_role, target_country, target_city, match_percentage, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        filePath,
        parsedText,
        targetRole,
        targetCountry,
        targetCity || null,
        matchPercentage,
        JSON.stringify(aiAnalysis),
      ]
    );

    res.status(201).json({ resume: result.rows[0] });
  } catch (err) {
    // Clean up uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
};

export const buildResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const formData = req.body;

    // Generate resume via AI
    const { resumeText, matchPercentage, aiAnalysis } =
      await generateResume(formData);

    // Insert into resumes table
    const result = await pool.query(
      `INSERT INTO resumes (user_id, parsed_text, target_role, target_country, target_city, match_percentage, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        resumeText,
        formData.targetRole,
        formData.targetCountry,
        formData.targetCity || null,
        matchPercentage,
        JSON.stringify(aiAnalysis),
      ]
    );

    const resume = result.rows[0];

    // Store form data in resume_data table
    await pool.query(
      `INSERT INTO resume_data (resume_id, form_data)
       VALUES ($1, $2)`,
      [resume.id, JSON.stringify(formData)]
    );

    res.status(201).json({ resume });
  } catch (err) {
    next(err);
  }
};

export const getResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.json({ resume: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const listResumes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;

    const result = await pool.query(
      'SELECT id, target_role, target_country, target_city, match_percentage, ats_score, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ resumes: result.rows });
  } catch (err) {
    next(err);
  }
};

export const deleteResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    // Check the resume exists and belongs to user
    const existing = await pool.query(
      'SELECT id, file_path FROM resumes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const filePath = existing.rows[0].file_path;

    // Delete resume_data first (child), then resumes (parent)
    await pool.query('DELETE FROM resume_data WHERE resume_id = $1', [id]);
    await pool.query('DELETE FROM resumes WHERE id = $1', [id]);

    // Clean up uploaded file from disk
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
};
