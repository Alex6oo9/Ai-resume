import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Re-categorize creative templates to modern (removing creative category)
  await pool.query(`
    UPDATE templates SET category = 'modern'
    WHERE name IN ('modern_yellow_split', 'editorial_earth_tone');
  `);

  // Seed ATS Clean template
  await pool.query(`
    INSERT INTO templates (name, display_name, description, category, is_ats_friendly, supports_multiple_columns, required_tier, sort_order)
    VALUES ('ats_clean', 'ATS Clean', 'Minimal whitespace-driven single-column layout. No decorative elements for maximum ATS compatibility.', 'ats', true, false, 'free', 12)
    ON CONFLICT (name) DO NOTHING;
  `);

  // Seed ATS Lined template
  await pool.query(`
    INSERT INTO templates (name, display_name, description, category, is_ats_friendly, supports_multiple_columns, required_tier, sort_order)
    VALUES ('ats_lined', 'ATS Lined', 'Single-column with navy accent border-bottom under each section heading. ATS-safe styling.', 'ats', true, false, 'free', 13)
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function down(_pool: Pool): Promise<void> {
  console.warn('025_add_ats_templates: down() is a no-op.');
}
