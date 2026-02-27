import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'modern_minimal'
  `);
}
