import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import pool from '../config/db';

async function resetDatabase(): Promise<void> {
  console.log('Resetting database — clearing all user data...\n');

  await pool.query(`
    TRUNCATE
      password_reset_tokens,
      email_verification_tokens,
      analysis_history,
      resume_history,
      resume_data,
      resumes,
      subscriptions,
      session,
      users
    CASCADE;
  `);

  console.log('Cleared: users, sessions, resumes, resume_data, resume_history,');
  console.log('         analysis_history, subscriptions, email_verification_tokens,');
  console.log('         password_reset_tokens\n');
  console.log('Preserved: templates, migrations\n');
  console.log('Database reset complete. You can now re-register with your emails.');

  await pool.end();
}

resetDatabase().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
