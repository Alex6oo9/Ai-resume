import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    ALTER TABLE cover_letters ADD COLUMN IF NOT EXISTS job_description TEXT DEFAULT NULL;
  `);
}
