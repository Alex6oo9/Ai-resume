import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    DELETE FROM templates
    WHERE name IN ('modern_minimal','creative_bold','professional_classic','tech_focused','healthcare_pro');
  `);

  await pool.query(`
    UPDATE resumes
    SET template_id = 'modern_yellow_split'
    WHERE template_id IN ('modern_minimal','creative_bold','professional_classic','tech_focused','healthcare_pro');
  `);
}

export async function down(_pool: Pool): Promise<void> {
  // Re-inserting removed templates and restoring per-resume template_ids is not
  // practical. This migration is intentionally irreversible.
  console.warn('023_remove_deleted_templates: down() is a no-op.');
}
