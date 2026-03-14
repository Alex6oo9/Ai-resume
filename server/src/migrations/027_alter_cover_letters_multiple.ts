import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    BEGIN;
    ALTER TABLE cover_letters DROP CONSTRAINT IF EXISTS cover_letters_resume_id_key;
    ALTER TABLE cover_letters ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
    DROP INDEX IF EXISTS idx_cover_letters_resume_id;
    CREATE INDEX IF NOT EXISTS idx_cover_letters_resume_created ON cover_letters(resume_id, created_at DESC);
    COMMIT;
  `);
}
