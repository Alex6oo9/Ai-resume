import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    INSERT INTO templates (
      id, name, display_name, description, category,
      thumbnail_url, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      gen_random_uuid(),
      'modern_minimalist_block',
      'Modern Minimalist Block',
      'A professional two-column layout with dark structural elements and strict alignment.',
      'modern',
      '/assets/templates/modern-minimalist-block-preview.svg',
      true,
      false,
      'free',
      10,
      true
    )
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`DELETE FROM templates WHERE name = 'modern_minimalist_block'`);
}
