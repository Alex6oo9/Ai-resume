import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS resumes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_path VARCHAR(500),
      parsed_text TEXT,
      target_role VARCHAR(255),
      target_country VARCHAR(100),
      target_city VARCHAR(100),
      match_percentage INTEGER,
      ai_analysis JSONB,
      ats_score INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query('DROP TABLE IF EXISTS resumes CASCADE;');
}
