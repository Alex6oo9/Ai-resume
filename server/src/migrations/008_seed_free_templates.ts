import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Insert 3 new free templates
  await pool.query(`
    INSERT INTO templates (name, display_name, description, category, supports_photo, supports_color_customization, is_ats_friendly, required_tier, sort_order)
    VALUES
      ('bold_accent', 'Bold Accent', 'Vibrant indigo header with bold accent lines for creative and design roles', 'creative', false, true, false, 'free', 6),
      ('clean_tech', 'Clean Tech', 'Skills-first layout with compact spacing for developers and engineers', 'modern', false, true, true, 'free', 7),
      ('executive_classic', 'Executive Classic', 'Elegant serif typography with gold accents for corporate and executive roles', 'professional', false, true, false, 'free', 8)
    ON CONFLICT (name) DO NOTHING;
  `);

  // Insert configuration for bold_accent
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 0, "right": 20, "bottom": 20, "left": 20}, "sectionSpacing": 14}'::jsonb,
      '{"headingFont": "Inter", "bodyFont": "Inter", "sizes": {"name": 22, "heading": 12, "subheading": 11, "body": 11}}'::jsonb,
      '{"primary": "#4f46e5", "secondary": "#6d28d9", "accent": "#6d28d9", "text": "#1e1b4b", "background": "#ffffff", "headerBackground": "#4f46e5", "headerTextColor": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "summary", "experience", "education", "skills", "projects", "additional"], "defaultOrder": ["personal_info", "summary", "experience", "education", "skills", "projects", "additional"]}'::jsonb
    FROM templates WHERE name = 'bold_accent'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Insert configuration for clean_tech
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 15, "right": 17, "bottom": 15, "left": 17}, "sectionSpacing": 10}'::jsonb,
      '{"headingFont": "Inter", "bodyFont": "Inter", "sizes": {"name": 20, "heading": 11, "subheading": 11, "body": 10}}'::jsonb,
      '{"primary": "#0ea5e9", "secondary": "#0f172a", "accent": "#0ea5e9", "text": "#0f172a", "background": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "skills", "experience", "projects", "education", "additional"], "defaultOrder": ["personal_info", "skills", "experience", "projects", "education", "additional"]}'::jsonb
    FROM templates WHERE name = 'clean_tech'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Insert configuration for executive_classic
  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"columns": 1, "margins": {"top": 22, "right": 22, "bottom": 22, "left": 22}, "sectionSpacing": 16}'::jsonb,
      '{"headingFont": "Times New Roman", "bodyFont": "Times New Roman", "sizes": {"name": 26, "heading": 13, "subheading": 12, "body": 11}}'::jsonb,
      '{"primary": "#1e3a5f", "secondary": "#4a6fa5", "accent": "#c9a84c", "text": "#1a1a1a", "background": "#ffffff"}'::jsonb,
      '{"available": ["personal_info", "summary", "experience", "education", "skills", "projects", "additional"], "defaultOrder": ["personal_info", "summary", "experience", "education", "skills", "projects", "additional"]}'::jsonb
    FROM templates WHERE name = 'executive_classic'
    ON CONFLICT (template_id) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    DELETE FROM template_configurations
    WHERE template_id IN (
      SELECT id FROM templates WHERE name IN ('bold_accent', 'clean_tech', 'executive_classic')
    );
  `);
  await pool.query(`
    DELETE FROM templates WHERE name IN ('bold_accent', 'clean_tech', 'executive_classic');
  `);
}
