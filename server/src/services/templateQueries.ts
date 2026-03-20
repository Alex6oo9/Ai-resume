import pool from '../config/db';
import {
  Template,
  Subscription,
  SubscriptionTier,
} from '../types/template.types';

const TIER_LEVEL: Record<SubscriptionTier, number> = {
  free: 0,
  monthly: 1,
  annual: 2,
};

function mapTemplate(row: any): Template {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    description: row.description,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    supportsMultipleColumns: row.supports_multiple_columns,
    isAtsFriendly: row.is_ats_friendly,
    requiredTier: row.required_tier,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}


export async function getAllTemplates(): Promise<Template[]> {
  const { rows } = await pool.query(
    'SELECT * FROM templates WHERE is_active = true ORDER BY sort_order ASC'
  );
  return rows.map(mapTemplate);
}

export async function getTemplateWithConfig(
  templateId: string
): Promise<Template | null> {
  const { rows } = await pool.query(
    'SELECT * FROM templates WHERE id = $1 AND is_active = true',
    [templateId]
  );
  if (!rows.length) return null;
  return mapTemplate(rows[0]);
}

export async function getActiveSubscription(
  userId: string
): Promise<Subscription | null> {
  const { rows } = await pool.query(
    `SELECT * FROM subscriptions
     WHERE user_id = $1 AND status = 'active'
     AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1`,
    [userId]
  );
  if (!rows.length) return null;
  return {
    id: rows[0].id,
    userId: rows[0].user_id,
    tier: rows[0].tier,
    status: rows[0].status,
    expiresAt: rows[0].expires_at,
  };
}

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const sub = await getActiveSubscription(userId);
  return sub?.tier || 'free';
}

export async function canUserAccessTemplate(
  userId: string,
  templateId: string
): Promise<boolean> {
  const userTier = await getUserTier(userId);

  const { rows } = await pool.query(
    'SELECT required_tier FROM templates WHERE id = $1 AND is_active = true',
    [templateId]
  );
  if (!rows.length) return false;

  const templateTier = rows[0].required_tier as SubscriptionTier;
  return TIER_LEVEL[userTier] >= TIER_LEVEL[templateTier];
}

export async function switchResumeTemplate(
  resumeId: string,
  userId: string,
  newTemplateId: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current template name for history
    const { rows: resumeRows } = await client.query(
      'SELECT template_id FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );
    if (!resumeRows.length) throw new Error('Resume not found');
    const previousTemplateName = resumeRows[0].template_id;

    // Get new template name by UUID
    const { rows: templateRows } = await client.query(
      'SELECT name FROM templates WHERE id = $1',
      [newTemplateId]
    );
    if (!templateRows.length) throw new Error('Template not found');
    const newTemplateName = templateRows[0].name;

    // Update resumes.template_id (stored as name/slug)
    await client.query(
      'UPDATE resumes SET template_id = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
      [newTemplateName, resumeId, userId]
    );

    // Log to history using template names (consistent with VARCHAR column)
    await client.query(
      `INSERT INTO resume_history
         (resume_id, user_id, change_type, previous_template_name, new_template_name, changed_fields)
       VALUES ($1, $2, 'template_switch', $3, $4, '["template_id"]')`,
      [resumeId, userId, previousTemplateName, newTemplateName]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
