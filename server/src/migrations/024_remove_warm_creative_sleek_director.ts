import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    DELETE FROM templates
    WHERE name IN ('warm_creative', 'sleek_director');
  `);
  await pool.query(`
    UPDATE resumes
    SET template_id = 'modern_yellow_split'
    WHERE template_id IN ('warm_creative', 'sleek_director');
  `);
}

export async function down(_pool: Pool): Promise<void> {
  console.warn('024_remove_warm_creative_sleek_director: down() is a no-op.');
}
