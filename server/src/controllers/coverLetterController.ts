import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import openai from '../config/openai';
import { generateCoverLetter as generateCoverLetterService } from '../services/ai/coverLetterGenerator';
import { extractKeywords as extractKeywordsService } from '../services/ai/keywordExtractor';
import { sanitizePromptInput } from '../utils/sanitizePromptInput';

function buildResumeTextFromFormData(formData: any): string {
  const lines: string[] = [];

  if (formData.fullName) lines.push(formData.fullName);
  if (formData.targetRole) lines.push(`Target Role: ${formData.targetRole}`);
  if (formData.professionalSummary) lines.push(`Summary: ${formData.professionalSummary}`);

  if (Array.isArray(formData.experience)) {
    for (const exp of formData.experience) {
      lines.push(`${exp.role || ''} at ${exp.company || ''}: ${exp.responsibilities || ''}`);
    }
  }

  if (formData.skills) {
    const { technical, soft } = formData.skills;
    if (Array.isArray(technical)) {
      for (const cat of technical) {
        if (cat.items?.length) lines.push(`${cat.category}: ${cat.items.join(', ')}`);
      }
    }
    if (Array.isArray(soft) && soft.length) {
      lines.push(`Soft skills: ${soft.join(', ')}`);
    }
  }

  return lines.join('\n');
}

function getResumeText(resume: any): string | null {
  if (resume.parsed_text?.trim()) {
    return resume.parsed_text;
  }
  if (resume.form_data) {
    const text = buildResumeTextFromFormData(resume.form_data);
    return text.trim() ? text : null;
  }
  return null;
}

export const extractKeywords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId, resumeText: rawResumeText, jobDescription } = req.body;

    let resumeText: string;

    if (rawResumeText) {
      // Direct text provided — skip DB lookup
      resumeText = sanitizePromptInput(rawResumeText).slice(0, 3000);
    } else {
      // Fall back to DB lookup by resumeId
      const resumeResult = await pool.query(
        `SELECT r.*, rd.form_data
         FROM resumes r
         LEFT JOIN resume_data rd ON r.id = rd.resume_id
         WHERE r.id = $1 AND r.user_id = $2`,
        [resumeId, userId]
      );

      if (resumeResult.rows.length === 0) {
        res.status(404).json({ message: 'Resume not found' });
        return;
      }

      const resume = resumeResult.rows[0];
      const text = getResumeText(resume);

      if (!text) {
        res.status(400).json({
          message: 'This resume has no content to extract keywords from. Please rebuild or re-upload it.',
        });
        return;
      }

      resumeText = text;
    }

    const result = await extractKeywordsService({ resumeText, jobDescription });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const generateCoverLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const {
      resumeId,
      resumeText: rawResumeText,
      fullName,
      targetRole,
      targetLocation,
      jobDescription,
      companyName,
      hiringManagerName,
      jobTitle,
      matchedKeywords,
      missingKeywords,
      tone,
      wordCountTarget,
      customInstructions,
    } = req.body;

    let resumeText: string;

    if (rawResumeText) {
      // Direct text provided — skip DB lookup
      resumeText = sanitizePromptInput(rawResumeText).slice(0, 3000);
    } else {
      const resumeResult = await pool.query(
        `SELECT r.*, rd.form_data
         FROM resumes r
         LEFT JOIN resume_data rd ON r.id = rd.resume_id
         WHERE r.id = $1 AND r.user_id = $2`,
        [resumeId, userId]
      );

      if (resumeResult.rows.length === 0) {
        res.status(404).json({ message: 'Resume not found' });
        return;
      }

      const resume = resumeResult.rows[0];
      const text = getResumeText(resume);

      if (!text) {
        res.status(400).json({
          message: 'This resume has no content to generate from. Please rebuild or re-upload it.',
        });
        return;
      }

      resumeText = text;
    }

    const generatedText = await generateCoverLetterService({
      resumeText,
      fullName,
      targetRole,
      targetLocation,
      jobDescription,
      matchedKeywords: Array.isArray(matchedKeywords) ? matchedKeywords : [],
      missingKeywords: Array.isArray(missingKeywords) ? missingKeywords : [],
      tone,
      wordCountTarget,
      companyName,
      hiringManagerName: hiringManagerName || null,
      customInstructions: customInstructions || null,
    });

    const insertResult = await pool.query(
      `INSERT INTO cover_letters (resume_id, user_id, content, generated_content, tone, word_count_target, company_name, hiring_manager_name, job_title, custom_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        resumeId || null,
        userId,
        generatedText,
        generatedText,
        tone,
        wordCountTarget,
        companyName,
        hiringManagerName || null,
        jobTitle || null,
        customInstructions || null,
      ]
    );

    res.status(201).json({ coverLetter: insertResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const listCoverLetters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;

    const result = await pool.query(
      `SELECT cl.*, r.target_role
       FROM cover_letters cl
       LEFT JOIN resumes r ON cl.resume_id = r.id
       WHERE cl.user_id = $1
       ORDER BY cl.updated_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({ coverLetters: result.rows });
  } catch (err) {
    next(err);
  }
};

export const listCoverLettersByResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { resumeId } = req.params;

    const resumeCheck = await pool.query(
      'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (resumeCheck.rows.length === 0) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }

    const result = await pool.query(
      `SELECT cl.*, r.target_role as resume_target_role
       FROM cover_letters cl
       JOIN resumes r ON cl.resume_id = r.id
       WHERE cl.resume_id = $1 AND r.user_id = $2
       ORDER BY cl.updated_at DESC`,
      [resumeId, userId]
    );

    res.json({ coverLetters: result.rows });
  } catch (err) {
    next(err);
  }
};

export const getCoverLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM cover_letters WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cover letter not found' });
      return;
    }

    res.json({ coverLetter: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateCoverLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { content } = req.body;

    const result = await pool.query(
      `UPDATE cover_letters
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [content, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cover letter not found' });
      return;
    }

    res.json({ coverLetter: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteCoverLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM cover_letters
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cover letter not found' });
      return;
    }

    res.json({ message: 'Cover letter deleted' });
  } catch (err) {
    next(err);
  }
};

export const regenerateCoverLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const {
      fullName,
      targetRole,
      targetLocation,
      jobDescription,
      companyName,
      hiringManagerName,
      matchedKeywords,
      missingKeywords,
      tone,
      wordCountTarget,
      customInstructions,
    } = req.body;

    const letterResult = await pool.query(
      `SELECT cl.resume_id, r.parsed_text, r.target_role, rd.form_data
       FROM cover_letters cl
       LEFT JOIN resumes r ON cl.resume_id = r.id
       LEFT JOIN resume_data rd ON r.id = rd.resume_id
       WHERE cl.id = $1 AND cl.user_id = $2`,
      [id, userId]
    );

    if (letterResult.rows.length === 0) {
      res.status(404).json({ message: 'Cover letter not found' });
      return;
    }

    const resumeData = letterResult.rows[0];

    if (!resumeData.resume_id) {
      res.status(400).json({
        message: 'Regenerate is not available for letters created from uploaded PDFs. Please create a new letter instead.',
      });
      return;
    }

    const resumeText = getResumeText(resumeData);

    if (!resumeText) {
      res.status(400).json({
        message: 'This resume has no content to generate from. Please rebuild or re-upload it.',
      });
      return;
    }

    const generatedText = await generateCoverLetterService({
      resumeText,
      fullName,
      targetRole,
      targetLocation,
      jobDescription,
      matchedKeywords: Array.isArray(matchedKeywords) ? matchedKeywords : [],
      missingKeywords: Array.isArray(missingKeywords) ? missingKeywords : [],
      tone,
      wordCountTarget,
      companyName,
      hiringManagerName: hiringManagerName || null,
      customInstructions: customInstructions || null,
    });

    const updateResult = await pool.query(
      `UPDATE cover_letters
       SET content = $1, generated_content = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [generatedText, id]
    );

    res.json({ coverLetter: updateResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const improveCoverLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { whyThisCompany, achievementToHighlight } = req.body;

    if (!whyThisCompany && !achievementToHighlight) {
      res.status(400).json({ message: 'At least one of whyThisCompany or achievementToHighlight is required.' });
      return;
    }

    // Verify ownership and fetch current generated_content
    const letterResult = await pool.query(
      `SELECT * FROM cover_letters WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (letterResult.rows.length === 0) {
      res.status(404).json({ message: 'Cover letter not found' });
      return;
    }

    const letter = letterResult.rows[0];
    const baseContent = letter.generated_content || letter.content;

    const sanitizedWhy = whyThisCompany ? sanitizePromptInput(whyThisCompany).slice(0, 300) : '';
    const sanitizedAchievement = achievementToHighlight
      ? sanitizePromptInput(achievementToHighlight).slice(0, 200)
      : '';

    const personalizations: string[] = [];
    if (sanitizedWhy) personalizations.push(`Personal reason for this company: ${sanitizedWhy}`);
    if (sanitizedAchievement) personalizations.push(`Achievement to highlight: ${sanitizedAchievement}`);

    const prompt = `Take this cover letter and improve it by weaving in the personalizations naturally. Preserve tone, structure, and length. Return only the improved cover letter text with no extra commentary.

Personalizations:
${personalizations.join('\n')}

Cover letter:
${baseContent}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const improvedText = completion.choices[0]?.message?.content?.trim() || baseContent;

    const updateResult = await pool.query(
      `UPDATE cover_letters
       SET content = $1, generated_content = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [improvedText, id]
    );

    res.json({ coverLetter: updateResult.rows[0] });
  } catch (err) {
    next(err);
  }
};
