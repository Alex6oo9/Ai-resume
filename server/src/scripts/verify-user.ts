import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import pool from '../config/db';

async function verifyUser(): Promise<void> {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run db:verify -- <email>');
    process.exit(1);
  }

  const result = await pool.query(
    'UPDATE users SET is_email_verified = TRUE WHERE email = $1 RETURNING email',
    [email]
  );

  if (result.rowCount === 0) {
    console.error(`No user found with email: ${email}`);
  } else {
    console.log(`Verified: ${result.rows[0].email}`);
  }

  await pool.end();
}

verifyUser().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
