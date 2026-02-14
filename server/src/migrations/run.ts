import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import pool from '../config/db';
import { up as createUsers } from './001_create_users';
import { up as createSessions } from './002_create_sessions';
import { up as createResumes } from './003_create_resumes';
import { up as createResumeData } from './004_create_resume_data';

const migrations = [
  { name: '001_create_users', up: createUsers },
  { name: '002_create_sessions', up: createSessions },
  { name: '003_create_resumes', up: createResumes },
  { name: '004_create_resume_data', up: createResumeData },
];

async function runMigrations(): Promise<void> {
  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  for (const migration of migrations) {
    const existing = await pool.query(
      'SELECT id FROM migrations WHERE name = $1',
      [migration.name]
    );

    if (existing.rows.length === 0) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up(pool);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [
        migration.name,
      ]);
      console.log(`Completed: ${migration.name}`);
    } else {
      console.log(`Skipping (already run): ${migration.name}`);
    }
  }

  console.log('All migrations complete.');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
