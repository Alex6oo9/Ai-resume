import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Insert Modern template as the new default (sort_order=0 puts it first)
  await pool.query(`
    INSERT INTO templates (name, display_name, description, category, is_ats_friendly, supports_multiple_columns, required_tier, sort_order)
    VALUES ('modern', 'Modern', 'Clean white layout with centered header and profile photo', 'modern', false, false, 'free', 0)
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function down(_pool: Pool): Promise<void> {
  await _pool.query(`DELETE FROM templates WHERE name = 'modern';`);
}
