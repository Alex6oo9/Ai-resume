import { Pool } from 'pg';

const TEMPLATE_THUMBNAILS: Array<{ name: string; thumbnail_url: string }> = [
  { name: 'modern', thumbnail_url: '/thumbnails/modern.png' },
  { name: 'modern_yellow_split', thumbnail_url: '/thumbnails/modern_yellow_split.png' },
  { name: 'dark_ribbon_modern', thumbnail_url: '/thumbnails/dark_ribbon_modern.png' },
  { name: 'modern_minimalist_block', thumbnail_url: '/thumbnails/modern_minimalist_block.png' },
  { name: 'editorial_earth_tone', thumbnail_url: '/thumbnails/editorial_earth_tone.png' },
  { name: 'ats_clean', thumbnail_url: '/thumbnails/ats_clean.png' },
  { name: 'ats_lined', thumbnail_url: '/thumbnails/ats_lined.png' },
];

export async function up(pool: Pool): Promise<void> {
  for (const { name, thumbnail_url } of TEMPLATE_THUMBNAILS) {
    await pool.query(
      'UPDATE templates SET thumbnail_url = $1 WHERE name = $2',
      [thumbnail_url, name]
    );
  }
}

export async function down(pool: Pool): Promise<void> {
  for (const { name } of TEMPLATE_THUMBNAILS) {
    await pool.query(
      'UPDATE templates SET thumbnail_url = NULL WHERE name = $1',
      [name]
    );
  }
}
