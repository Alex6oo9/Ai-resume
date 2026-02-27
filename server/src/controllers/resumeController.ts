import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import pool from '../config/db';
import { extractTextFromPDF } from '../services/parser/pdfParser';
import { analyzeResume } from '../services/ai/resumeAnalyzer';
import { generateResume } from '../services/ai/resumeGenerator';
import { extractResumeStructure } from '../services/ai/resumeStructureExtractor';
import { sanitizePromptInput } from '../utils/sanitizePromptInput';

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
    const { targetRole, targetCountry, targetCity, jobDescription } = req.body;

    const sanitizedJd = jobDescription
      ? sanitizePromptInput(jobDescription)
      : null;

    // Extract text from PDF
    const parsedText = await extractTextFromPDF(filePath!);

    // Analyze with AI
    const { matchPercentage, aiAnalysis } = await analyzeResume({
      resumeText: parsedText,
      targetRole,
      targetCountry,
      targetCity,
      jobDescription: sanitizedJd || undefined,
    });

    // Extract structure for PDF export (best-effort — never block upload on failure)
    let extractedFormData: object | null = null;
    try {
      extractedFormData = await extractResumeStructure({
        resumeText: parsedText,
        targetRole,
      });
    } catch {
      // silently continue — export will show "not available" if form_data is missing
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO resumes (user_id, file_path, parsed_text, target_role, target_country, target_city, match_percentage, ai_analysis, job_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        sanitizedJd,
      ]
    );

    const resume = result.rows[0];

    // Record initial analysis in history
    await pool.query(
      `INSERT INTO analysis_history (resume_id, user_id, target_role, job_description, match_percentage, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        resume.id,
        userId,
        targetRole,
        sanitizedJd,
        matchPercentage,
        JSON.stringify(aiAnalysis),
      ]
    );

    // Store extracted form data so PDF export works for Path A resumes
    if (extractedFormData) {
      await pool.query(
        'INSERT INTO resume_data (resume_id, form_data) VALUES ($1, $2)',
        [
          resume.id,
          JSON.stringify({ ...extractedFormData, targetRole, targetCountry, targetCity }),
        ]
      );
    }

    res.status(201).json({ resume });
  } catch (err) {
    // Clean up uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
};

/**
 * Transform frontend form data to backend expected format
 * Frontend sends nested skills object, backend expects flat structure
 */
function transformFormData(formData: any): any {
  // Handle skills transformation
  const skills = formData.skills || {};

  // Transform technical skills: array of categories → comma-separated string
  const technicalSkills = (skills.technical || [])
    .map((cat: any) => {
      const categoryName = cat.category || '';
      const items = (cat.items || []).join(', ');
      return items ? `${categoryName}: ${items}` : '';
    })
    .filter((s: string) => s.trim())
    .join('; ');

  // Soft skills: already array of strings
  const softSkills = skills.soft || [];

  // Transform languages: {language, proficiency} → {name, proficiency}
  const languages = (skills.languages || []).map((lang: any) => ({
    name: lang.language || '',
    proficiency: lang.proficiency || 'basic',
  }));

  return {
    ...formData,
    technicalSkills,
    softSkills,
    languages,
  };
}

export const buildResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const rawFormData = req.body;

    // Transform form data to match backend expectations
    const formData = transformFormData(rawFormData);

    // Generate resume via AI
    const { resumeText, matchPercentage, aiAnalysis } =
      await generateResume(formData);

    const templateId = rawFormData.templateId || 'modern_minimal';

    // Insert into resumes table
    const result = await pool.query(
      `INSERT INTO resumes (user_id, parsed_text, target_role, target_country, target_city, match_percentage, ai_analysis, template_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        resumeText,
        formData.targetRole,
        formData.targetCountry,
        formData.targetCity || null,
        matchPercentage,
        JSON.stringify(aiAnalysis),
        templateId,
      ]
    );

    const resume = result.rows[0];

    // Store form data in resume_data table (use raw data to preserve frontend structure)
    await pool.query(
      `INSERT INTO resume_data (resume_id, form_data)
       VALUES ($1, $2)`,
      [resume.id, JSON.stringify(rawFormData)]
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
      `SELECT r.*, rd.form_data
       FROM resumes r
       LEFT JOIN resume_data rd ON r.id = rd.resume_id
       WHERE r.id = $1 AND r.user_id = $2`,
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

/**
 * Save resume draft
 * POST /api/resume/draft/save
 */
export const saveDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId, formData } = req.body;

    if (!formData) {
      res.status(400).json({ error: 'Form data is required' });
      return;
    }

    let finalResumeId = resumeId;

    if (resumeId) {
      // Update existing draft
      const existing = await pool.query(
        'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
        [resumeId, userId]
      );

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      // Update resume metadata
      await pool.query(
        `UPDATE resumes
         SET target_role = $1, target_country = $2, target_city = $3,
             status = 'draft', updated_at = NOW()
         WHERE id = $4`,
        [
          formData.targetRole || null,
          formData.targetCountry || null,
          formData.targetCity || null,
          resumeId,
        ]
      );

      // Update form data
      await pool.query(
        `INSERT INTO resume_data (resume_id, form_data)
         VALUES ($1, $2)
         ON CONFLICT (resume_id)
         DO UPDATE SET form_data = $2`,
        [resumeId, JSON.stringify(formData)]
      );
    } else {
      // Create new draft
      const result = await pool.query(
        `INSERT INTO resumes (user_id, target_role, target_country, target_city, status, created_with_live_preview)
         VALUES ($1, $2, $3, $4, 'draft', true)
         RETURNING id`,
        [
          userId,
          formData.targetRole || null,
          formData.targetCountry || null,
          formData.targetCity || null,
        ]
      );

      finalResumeId = result.rows[0].id;

      // Insert form data
      await pool.query(
        `INSERT INTO resume_data (resume_id, form_data)
         VALUES ($1, $2)`,
        [finalResumeId, JSON.stringify(formData)]
      );
    }

    res.status(200).json({
      success: true,
      resumeId: finalResumeId,
      message: 'Draft saved successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Load resume draft
 * GET /api/resume/draft/:id
 */
export const loadDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    // Get resume metadata
    const resumeResult = await pool.query(
      'SELECT id, updated_at FROM resumes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (resumeResult.rows.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const resume = resumeResult.rows[0];

    // Get form data
    const dataResult = await pool.query(
      'SELECT form_data FROM resume_data WHERE resume_id = $1',
      [id]
    );

    if (dataResult.rows.length === 0) {
      res.status(404).json({ error: 'Resume data not found' });
      return;
    }

    res.status(200).json({
      resumeId: resume.id,
      formData: dataResult.rows[0].form_data,
      updatedAt: resume.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Serve the original uploaded PDF for a Path A resume
 * GET /api/resume/:id/file
 */
export const getResumeFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT file_path FROM resumes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0 || !result.rows[0].file_path) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const filePath = result.rows[0].file_path;
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(resolvedPath);
  } catch (err) {
    next(err);
  }
};
