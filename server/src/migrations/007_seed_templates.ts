import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    -- Insert 5 initial templates
    INSERT INTO templates (name, display_name, description, category, supports_photo, supports_color_customization, is_ats_friendly, required_tier, sort_order)
    VALUES
      ('modern_minimal', 'Modern Minimal', 'Clean contemporary design with subtle colors', 'modern', true, true, false, 'free', 1),
      ('ats_friendly', 'ATS Optimized', 'Plain-text friendly, passes Applicant Tracking Systems', 'ats', false, false, true, 'free', 2),
      ('creative_bold', 'Creative Bold', 'Stand out with vibrant colors and unique layout', 'creative', true, true, false, 'monthly', 3),
      ('professional_classic', 'Professional Classic', 'Traditional format for corporate positions', 'professional', true, true, false, 'monthly', 4),
      ('tech_focused', 'Tech Focused', 'Optimized for software engineering roles', 'modern', false, true, true, 'annual', 5)
    ON CONFLICT (name) DO NOTHING;
  `);

  // Insert configuration for modern_minimal
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 15, "right": 15, "bottom": 15, "left": 15}, "sectionSpacing": 12}'::jsonb,
      '{"headingFont": "Inter", "bodyFont": "Roboto", "sizes": {"name": 28, "heading": 16, "subheading": 14, "body": 11}}'::jsonb,
      '{"primary": "#2563eb", "secondary": "#64748b", "accent": "#3b82f6", "text": "#1e293b", "background": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "summary", "experience", "education", "skills", "projects", "certifications"], "defaultOrder": ["personal_info", "summary", "experience", "education", "skills"]}'::jsonb
    FROM templates WHERE name = 'modern_minimal'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Insert configuration for ats_friendly
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}, "sectionSpacing": 10}'::jsonb,
      '{"headingFont": "Arial", "bodyFont": "Arial", "sizes": {"name": 24, "heading": 14, "subheading": 12, "body": 11}}'::jsonb,
      '{"primary": "#000000", "secondary": "#333333", "accent": "#000000", "text": "#000000", "background": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "summary", "experience", "education", "skills"], "defaultOrder": ["personal_info", "summary", "experience", "education", "skills"]}'::jsonb
    FROM templates WHERE name = 'ats_friendly'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Insert configuration for creative_bold
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 2, "margins": {"top": 0, "right": 0, "bottom": 0, "left": 0}, "sectionSpacing": 16}'::jsonb,
      '{"headingFont": "Playfair Display", "bodyFont": "Lato", "sizes": {"name": 32, "heading": 18, "subheading": 14, "body": 11}}'::jsonb,
      '{"primary": "#7c3aed", "secondary": "#a78bfa", "accent": "#c4b5fd", "text": "#1e1b4b", "background": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "summary", "skills", "experience", "education", "projects"], "defaultOrder": ["personal_info", "summary", "skills", "experience", "education"]}'::jsonb
    FROM templates WHERE name = 'creative_bold'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Insert configuration for professional_classic
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 25, "right": 25, "bottom": 25, "left": 25}, "sectionSpacing": 14}'::jsonb,
      '{"headingFont": "Georgia", "bodyFont": "Times New Roman", "sizes": {"name": 26, "heading": 15, "subheading": 13, "body": 11}}'::jsonb,
      '{"primary": "#1e3a5f", "secondary": "#4a6fa5", "accent": "#c9a84c", "text": "#1a1a1a", "background": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "summary", "experience", "education", "skills", "certifications"], "defaultOrder": ["personal_info", "summary", "experience", "education", "skills"]}'::jsonb
    FROM templates WHERE name = 'professional_classic'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Insert configuration for tech_focused
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 15, "right": 15, "bottom": 15, "left": 15}, "sectionSpacing": 10}'::jsonb,
      '{"headingFont": "JetBrains Mono", "bodyFont": "Inter", "sizes": {"name": 24, "heading": 14, "subheading": 12, "body": 10}}'::jsonb,
      '{"primary": "#0f172a", "secondary": "#0ea5e9", "accent": "#38bdf8", "text": "#0f172a", "background": "#f8fafc"}'::jsonb,
      '{"available": ["personal_info", "skills", "experience", "projects", "education", "certifications"], "defaultOrder": ["personal_info", "skills", "experience", "projects", "education"]}'::jsonb
    FROM templates WHERE name = 'tech_focused'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Map existing resume template_id values to new template names
  // 'ats' -> 'ats_friendly', 'simple' -> 'modern_minimal', anything else -> 'modern_minimal'
  await pool.query(`
    UPDATE resumes
    SET template_id = CASE
      WHEN template_id = 'ats' THEN 'ats_friendly'
      WHEN template_id = 'simple' THEN 'modern_minimal'
      ELSE 'modern_minimal'
    END
    WHERE template_id NOT IN (
      SELECT name FROM templates
    );
  `);
}

export async function down(pool: Pool): Promise<void> {
  // Revert template names back to old values
  await pool.query(`
    UPDATE resumes
    SET template_id = CASE
      WHEN template_id = 'ats_friendly' THEN 'ats'
      WHEN template_id = 'modern_minimal' THEN 'simple'
      ELSE 'ats'
    END
    WHERE template_id IN ('ats_friendly', 'modern_minimal', 'creative_bold', 'professional_classic', 'tech_focused');
  `);

  await pool.query(`DELETE FROM template_configurations;`);
  await pool.query(`DELETE FROM templates;`);
}
