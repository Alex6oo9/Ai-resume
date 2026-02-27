import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    INSERT INTO templates (
      id, name, display_name, description, category,
      thumbnail_url, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      gen_random_uuid(),
      'dark_ribbon_modern',
      'Dark Ribbon Modern',
      'A striking two-column design with a dark sidebar and elegant ribbon-style section headers.',
      'modern',
      '/assets/templates/dark-ribbon-modern-preview.svg',
      true,
      false,
      'free',
      9,
      true
    )
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`DELETE FROM templates WHERE name = 'dark_ribbon_modern'`);
}
