import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    BEGIN;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'local';
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    COMMIT;
  `);
}
