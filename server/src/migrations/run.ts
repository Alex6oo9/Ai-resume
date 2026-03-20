import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import pool from '../config/db';
import { up as createUsers } from './001_create_users';
import { up as createSessions } from './002_create_sessions';
import { up as createResumes } from './003_create_resumes';
import { up as createResumeData } from './004_create_resume_data';
import { up as addLivePreviewColumns } from './005_add_live_preview_columns';
import { up as addTemplates } from './006_add_templates';
import { up as seedTemplates } from './007_seed_templates';
import { up as seedFreeTemplates } from './008_seed_free_templates';
import { up as seedNewTemplates } from './009_seed_new_templates';
import { up as seedSleekDirector } from './010_seed_sleek_director_template';
import { up as deleteUnwantedTemplates } from './011_delete_unwanted_templates';
import { up as perTemplateCleanup } from './012_per_template_cleanup';
import { up as addModernYellowSplit } from './013_add_modern_yellow_split_template';
import { up as addTemplateIdToResumes } from './014_add_template_id_to_resumes';
import { up as addDarkRibbonModern } from './015_add_dark_ribbon_modern_template';
import { up as addModernMinimalistBlock } from './016_add_modern_minimalist_block_template';
import { up as addEditorialEarthTone } from './017_add_editorial_earth_tone_template';
import { up as addJobDescription } from './018_add_job_description';
import { up as addAnalysisHistory } from './019_add_analysis_history';
import { up as emailVerification } from './020_email_verification';
import { up as passwordReset } from './021_password_reset';
import { up as createCoverLetters } from './022_create_cover_letters';
import { up as removeDeletedTemplates } from './023_remove_deleted_templates';
import { up as removeWarmCreativeSleekDirector } from './024_remove_warm_creative_sleek_director';
import { up as addAtsTemplates } from './025_add_ats_templates';
import { up as addModernTemplate } from './026_add_modern_template';
import { up as alterCoverLettersMultiple } from './027_alter_cover_letters_multiple';
import { up as allowNullResumeIdCoverLetters } from './028_allow_null_resume_id_cover_letters';
import { up as updateTemplateThumbnails } from './029_update_template_thumbnails';

const migrations = [
  { name: '001_create_users', up: createUsers },
  { name: '002_create_sessions', up: createSessions },
  { name: '003_create_resumes', up: createResumes },
  { name: '004_create_resume_data', up: createResumeData },
  { name: '005_add_live_preview_columns', up: addLivePreviewColumns },
  { name: '006_add_templates', up: addTemplates },
  { name: '007_seed_templates', up: seedTemplates },
  { name: '008_seed_free_templates', up: seedFreeTemplates },
  { name: '009_seed_new_templates', up: seedNewTemplates },
  { name: '010_seed_sleek_director_template', up: seedSleekDirector },
  { name: '011_delete_unwanted_templates', up: deleteUnwantedTemplates },
  { name: '012_per_template_cleanup', up: perTemplateCleanup },
  { name: '013_add_modern_yellow_split_template', up: addModernYellowSplit },
  { name: '014_add_template_id_to_resumes', up: addTemplateIdToResumes },
  { name: '015_add_dark_ribbon_modern_template', up: addDarkRibbonModern },
  { name: '016_add_modern_minimalist_block_template', up: addModernMinimalistBlock },
  { name: '017_add_editorial_earth_tone_template', up: addEditorialEarthTone },
  { name: '018_add_job_description', up: addJobDescription },
  { name: '019_add_analysis_history', up: addAnalysisHistory },
  { name: '020_email_verification', up: emailVerification },
  { name: '021_password_reset', up: passwordReset },
  { name: '022_create_cover_letters', up: createCoverLetters },
  { name: '023_remove_deleted_templates', up: removeDeletedTemplates },
  { name: '024_remove_warm_creative_sleek_director', up: removeWarmCreativeSleekDirector },
  { name: '025_add_ats_templates', up: addAtsTemplates },
  { name: '026_add_modern_template', up: addModernTemplate },
  { name: '027_alter_cover_letters_multiple', up: alterCoverLettersMultiple },
  { name: '028_allow_null_resume_id_cover_letters', up: allowNullResumeIdCoverLetters },
  { name: '029_update_template_thumbnails', up: updateTemplateThumbnails },
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
