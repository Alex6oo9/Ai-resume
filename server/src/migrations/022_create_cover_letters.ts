import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cover_letters (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      resume_id             UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content               TEXT NOT NULL,
      generated_content     TEXT NOT NULL,
      tone                  VARCHAR(50) NOT NULL DEFAULT 'professional',
      word_count_target     VARCHAR(20) NOT NULL DEFAULT 'medium',
      company_name          VARCHAR(255),
      hiring_manager_name   VARCHAR(255),
      custom_instructions   TEXT,
      created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(resume_id)
    );

    CREATE INDEX IF NOT EXISTS idx_cover_letters_resume_id ON cover_letters(resume_id);
    CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
  `);
}
