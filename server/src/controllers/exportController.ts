import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { generatePdf } from '../services/export/pdfGenerator';
import { generateMarkdown } from '../services/export/markdownGenerator';
import { buildResumeHtml } from '../services/export/htmlTemplate';

/**
 * Transform frontend form data to backend expected format
 * Same as in resumeController.ts - needed for export functionality
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

async function getResumeData(resumeId: string, userId: string) {
  const resumeResult = await pool.query(
    'SELECT id, user_id, parsed_text, target_role FROM resumes WHERE id = $1 AND user_id = $2',
    [resumeId, userId]
  );

  if (resumeResult.rows.length === 0) {
    return null;
  }

  const resume = resumeResult.rows[0];

  const formDataResult = await pool.query(
    'SELECT form_data FROM resume_data WHERE resume_id = $1',
    [resumeId]
  );

  // form_data is JSONB, already parsed by PostgreSQL
  const formData = formDataResult.rows.length
    ? formDataResult.rows[0].form_data
    : null;

  return { resume, formData };
}

export const exportPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('[PDF Export] Started');
    const { resumeId } = req.params;
    const userId = (req.user as any).id;

    if (!resumeId || !resumeId.trim()) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    const data = await getResumeData(resumeId, userId);
    if (!data) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const { resume, formData } = data;

    console.log('[PDF Export] Building HTML');
    // Transform formData if it exists (convert frontend format to backend format)
    const transformedFormData = formData ? transformFormData(formData) : undefined;

    const html = buildResumeHtml({
      formData: transformedFormData,
      parsedText: resume.parsed_text,
      targetRole: resume.target_role,
    });

    console.log('[PDF Export] Generating PDF with Puppeteer');
    const pdfBuffer = await generatePdf(html);
    console.log('[PDF Export] PDF generated successfully');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="resume.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF Export] Error:', err);
    next(err);
  }
};

export const exportPdfFromHtml = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { html } = req.body;
    if (!html || typeof html !== 'string') {
      res.status(400).json({ error: 'html is required' });
      return;
    }
    const pdfBuffer = await generatePdf(html, { margins: false });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const exportMarkdown = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId } = req.params;
    const userId = (req.user as any).id;

    if (!resumeId || !resumeId.trim()) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    const data = await getResumeData(resumeId, userId);
    if (!data) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const { resume, formData } = data;

    // Transform formData if it exists (convert frontend format to backend format)
    const transformedFormData = formData ? transformFormData(formData) : undefined;

    const markdown = generateMarkdown({
      formData: transformedFormData,
      parsedText: resume.parsed_text,
      targetRole: resume.target_role,
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="resume.md"'
    );
    res.send(markdown);
  } catch (err) {
    next(err);
  }
};
