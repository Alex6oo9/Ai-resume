import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    INSERT INTO templates (
      id, name, display_name, description, category,
      thumbnail_url, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      gen_random_uuid(),
      'modern_yellow_split',
      'Modern Yellow Split',
      'A bold two-column design with a dark sidebar and striking yellow accents, perfect for creative and design roles.',
      'creative',
      '/assets/templates/modern-yellow-split-preview.svg',
      true,
      false,
      'free',
      8,
      true
    )
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`DELETE FROM templates WHERE name = 'modern_yellow_split'`);
}
