import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    ALTER TABLE cover_letters ALTER COLUMN resume_id DROP NOT NULL;
  `);
}
