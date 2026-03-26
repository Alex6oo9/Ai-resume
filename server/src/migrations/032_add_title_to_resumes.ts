import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`ALTER TABLE resumes ADD COLUMN IF NOT EXISTS title VARCHAR(255)`);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`ALTER TABLE resumes DROP COLUMN IF EXISTS title`);
}
