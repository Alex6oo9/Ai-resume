import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    INSERT INTO templates (
      id, name, display_name, description, category,
      thumbnail_url, supports_multiple_columns,
      is_ats_friendly, required_tier, sort_order, is_active
    ) VALUES (
      gen_random_uuid(),
      'editorial_earth_tone',
      'Editorial Earth-Tone Profile',
      'An elegant, magazine-style layout featuring warm earth tones, prominent typography, and a structured two-column design.',
      'creative',
      '/assets/templates/editorial-earth-tone-preview.svg',
      true,
      false,
      'free',
      11,
      true
    )
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`DELETE FROM templates WHERE name = 'editorial_earth_tone'`);
}
