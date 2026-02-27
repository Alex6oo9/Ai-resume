import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    INSERT INTO templates (
      name, display_name, description, category,
      thumbnail_url, preview_images,
      supports_photo, supports_color_customization, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      'sleek_director',
      'Sleek Director',
      'A modern, high-contrast design with bold typography and support for a profile photo.',
      'professional',
      '/assets/templates/sleek_director-preview.svg',
      '[]'::jsonb,
      true,
      true,
      false,
      true,
      'free',
      11,
      true
    ) ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO template_configurations (template_id, layout, typography, color_scheme, sections)
    SELECT id,
      '{"margins": "0.75in", "pageWidth": "8.5in", "lineHeight": "1.5", "sectionSpacing": "16pt", "paragraphSpacing": "8pt"}'::jsonb,
      '{"fontFamily": "Montserrat, Inter, sans-serif", "fontSize": {"name": "24pt", "heading": "13pt", "subheading": "11.5pt", "body": "10.5pt"}}'::jsonb,
      '{"primary": "#111827", "accent": "#111827", "text": "#374151", "background": "#ffffff", "headerBackground": "#f9fafb", "headerText": "#111827"}'::jsonb,
      '{"order": ["contact","summary","experience","education","skills","projects","additional"], "headingFormat": "uppercase", "showSectionDividers": false, "dividerStyle": "spacing"}'::jsonb
    FROM templates WHERE name = 'sleek_director'
    ON CONFLICT (template_id) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    DELETE FROM template_configurations
    WHERE template_id IN (
      SELECT id FROM templates WHERE name = 'sleek_director'
    );
  `);
  await pool.query(`
    DELETE FROM templates WHERE name = 'sleek_director';
  `);
}
