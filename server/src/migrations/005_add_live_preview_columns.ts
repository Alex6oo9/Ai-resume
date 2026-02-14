import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    -- Add new columns to resumes table
    ALTER TABLE resumes
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'ats',
      ADD COLUMN IF NOT EXISTS created_with_live_preview BOOLEAN DEFAULT FALSE;

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
    CREATE INDEX IF NOT EXISTS idx_resumes_template_id ON resumes(template_id);
    CREATE INDEX IF NOT EXISTS idx_resumes_live_preview ON resumes(created_with_live_preview);

    -- Update existing resumes to have proper status
    UPDATE resumes
    SET status = CASE
      WHEN match_percentage IS NOT NULL THEN 'complete'
      ELSE 'draft'
    END,
    created_with_live_preview = FALSE
    WHERE status IS NULL OR created_with_live_preview IS NULL;

    -- Create AI cache table for storing OpenAI responses
    CREATE TABLE IF NOT EXISTS ai_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cache_key VARCHAR(255) UNIQUE NOT NULL,
      cache_value JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
    );

    -- Create indexes for AI cache lookups
    CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);

    -- Add comment for documentation
    COMMENT ON TABLE ai_cache IS 'Caches AI-generated content (skills, summaries) to reduce OpenAI API costs';
    COMMENT ON COLUMN resumes.status IS 'Resume lifecycle status: draft, complete, or exported';
    COMMENT ON COLUMN resumes.template_id IS 'Selected template: ats or simple';
    COMMENT ON COLUMN resumes.created_with_live_preview IS 'Flag to distinguish new live preview resumes from legacy resumes';
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    -- Remove AI cache table
    DROP TABLE IF EXISTS ai_cache CASCADE;

    -- Remove indexes
    DROP INDEX IF EXISTS idx_resumes_status;
    DROP INDEX IF EXISTS idx_resumes_template_id;
    DROP INDEX IF EXISTS idx_resumes_live_preview;

    -- Remove columns from resumes table
    ALTER TABLE resumes
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS template_id,
      DROP COLUMN IF EXISTS created_with_live_preview;
  `);
}
