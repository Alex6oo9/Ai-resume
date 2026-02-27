import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS template_configurations CASCADE;
    ALTER TABLE templates DROP COLUMN IF EXISTS supports_color_customization;
    ALTER TABLE templates DROP COLUMN IF EXISTS preview_images;
    ALTER TABLE templates DROP COLUMN IF EXISTS supports_photo;
  `);
}
