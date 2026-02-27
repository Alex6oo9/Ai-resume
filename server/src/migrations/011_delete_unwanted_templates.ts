import { Pool } from 'pg';

// Templates to remove
const NAMES_TO_DELETE = [
  'ats_friendly',
  'bold_accent',
  'clean_tech',
  'executive_classic',
  'sales_pro',
  'academic_researcher',
  'modern_ats',
];

export async function up(pool: Pool): Promise<void> {
  // template_configurations has ON DELETE CASCADE, so deleting from templates
  // automatically removes the linked configuration rows.
  await pool.query(
    `DELETE FROM templates WHERE name = ANY($1::text[])`,
    [NAMES_TO_DELETE]
  );
}

export async function down(pool: Pool): Promise<void> {
  // Re-insertion is handled by re-running migrations 007, 008, and 009.
  // This down() is a no-op to avoid duplicating seed logic here.
  console.log('down() for 011_delete_unwanted_templates: re-run migrations 007–009 to restore.');
}
