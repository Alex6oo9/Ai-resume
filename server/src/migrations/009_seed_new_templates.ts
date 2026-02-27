import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Healthcare Professional
  await pool.query(`
    INSERT INTO templates (
      name, display_name, description, category,
      supports_photo, supports_color_customization, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      'healthcare_pro',
      'Healthcare Professional',
      'Clean and approachable design with soft teal accents for healthcare professionals.',
      'professional',
      true, false, false, false, 'free', 6, true
    ) ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"margins": "0.7in", "pageWidth": "8.5in", "lineHeight": "1.45", "sectionSpacing": "13pt", "paragraphSpacing": "7pt"}'::jsonb,
      '{"fontFamily": "Lato, Arial, sans-serif", "fontSize": {"name": "22pt", "heading": "12pt", "subheading": "11pt", "body": "11pt"}}'::jsonb,
      '{"primary": "#0d9488", "accent": "#14b8a6", "text": "#2c2c2c", "background": "#ffffff", "headerBackground": "#0f766e", "headerText": "#ffffff"}'::jsonb,
      '{"order": ["contact","summary","experience","education","additional","skills","projects"], "headingFormat": "titlecase", "showSectionDividers": true, "dividerStyle": "line"}'::jsonb
    FROM templates WHERE name = 'healthcare_pro'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Sales Professional
  await pool.query(`
    INSERT INTO templates (
      name, display_name, description, category,
      supports_photo, supports_color_customization, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      'sales_pro',
      'Sales Professional',
      'Bold and energetic design with vibrant orange accents for sales professionals.',
      'creative',
      true, false, false, false, 'free', 7, true
    ) ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"margins": "0.65in", "pageWidth": "8.5in", "lineHeight": "1.4", "sectionSpacing": "12pt", "paragraphSpacing": "6pt"}'::jsonb,
      '{"fontFamily": "Montserrat, Verdana, sans-serif", "fontSize": {"name": "24pt", "heading": "13pt", "subheading": "11pt", "body": "10.5pt"}}'::jsonb,
      '{"primary": "#ea580c", "accent": "#f97316", "text": "#1f1f1f", "background": "#ffffff", "headerBackground": "#ea580c", "headerText": "#ffffff"}'::jsonb,
      '{"order": ["contact","summary","experience","skills","education","projects","additional"], "headingFormat": "uppercase", "showSectionDividers": true, "dividerStyle": "spacing"}'::jsonb
    FROM templates WHERE name = 'sales_pro'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Warm Creative
  await pool.query(`
    INSERT INTO templates (
      name, display_name, description, category,
      supports_photo, supports_color_customization, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      'warm_creative',
      'Warm Creative',
      'Warm terracotta tones and friendly typography for creative content professionals.',
      'creative',
      true, false, false, false, 'free', 8, true
    ) ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"margins": "0.75in", "pageWidth": "8.5in", "lineHeight": "1.5", "sectionSpacing": "14pt", "paragraphSpacing": "7pt"}'::jsonb,
      '{"fontFamily": "Open Sans, Verdana, sans-serif", "fontSize": {"name": "23pt", "heading": "12pt", "subheading": "11pt", "body": "11pt"}}'::jsonb,
      '{"primary": "#bf360c", "accent": "#d84315", "text": "#3e2723", "background": "#ffffff", "headerBackground": "#d84315", "headerText": "#fff8e1"}'::jsonb,
      '{"order": ["contact","summary","experience","projects","education","skills","additional"], "headingFormat": "titlecase", "showSectionDividers": true, "dividerStyle": "line"}'::jsonb
    FROM templates WHERE name = 'warm_creative'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Academic Researcher
  await pool.query(`
    INSERT INTO templates (
      name, display_name, description, category,
      supports_photo, supports_color_customization, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      'academic_researcher',
      'Academic Researcher',
      'Traditional serif design with generous spacing for academic and research positions.',
      'professional',
      false, false, false, true, 'free', 9, true
    ) ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"margins": "0.85in", "pageWidth": "8.5in", "lineHeight": "1.5", "sectionSpacing": "15pt", "paragraphSpacing": "8pt"}'::jsonb,
      '{"fontFamily": "Georgia, Times New Roman, serif", "fontSize": {"name": "20pt", "heading": "12pt", "subheading": "11pt", "body": "11pt"}}'::jsonb,
      '{"primary": "#1a1a1a", "accent": "#424242", "text": "#212121", "background": "#ffffff", "headerBackground": null, "headerText": null}'::jsonb,
      '{"order": ["contact","summary","education","experience","projects","additional","skills"], "headingFormat": "titlecase", "showSectionDividers": true, "dividerStyle": "line"}'::jsonb
    FROM templates WHERE name = 'academic_researcher'
    ON CONFLICT (template_id) DO NOTHING;
  `);

  // Modern ATS
  await pool.query(`
    INSERT INTO templates (
      name, display_name, description, category,
      supports_photo, supports_color_customization, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      'modern_ats',
      'Modern ATS',
      'Clean, modern ATS-optimized template with refined typography and maximum compatibility.',
      'professional',
      false, false, false, true, 'free', 10, true
    ) ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"margins": "0.75in", "pageWidth": "8.5in", "lineHeight": "1.4", "sectionSpacing": "12pt", "paragraphSpacing": "6pt"}'::jsonb,
      '{"fontFamily": "Roboto, Arial, sans-serif", "fontSize": {"name": "18pt", "heading": "12pt", "subheading": "11pt", "body": "11pt"}}'::jsonb,
      '{"primary": "#000000", "accent": "#1a1a1a", "text": "#1a1a1a", "background": "#ffffff", "headerBackground": null, "headerText": null}'::jsonb,
      '{"order": ["contact","summary","education","experience","skills","projects","additional"], "headingFormat": "uppercase", "showSectionDividers": true, "dividerStyle": "spacing"}'::jsonb
    FROM templates WHERE name = 'modern_ats'
    ON CONFLICT (template_id) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    DELETE FROM template_configurations
    WHERE template_id IN (
      SELECT id FROM templates
      WHERE name IN ('healthcare_pro', 'sales_pro', 'warm_creative', 'academic_researcher', 'modern_ats')
    );
  `);
  await pool.query(`
    DELETE FROM templates
    WHERE name IN ('healthcare_pro', 'sales_pro', 'warm_creative', 'academic_researcher', 'modern_ats');
  `);
}
