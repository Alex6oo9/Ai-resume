import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    -- Templates catalog
    CREATE TABLE IF NOT EXISTS templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      thumbnail_url VARCHAR(500),
      preview_images JSONB DEFAULT '[]',
      supports_photo BOOLEAN DEFAULT false,
      supports_color_customization BOOLEAN DEFAULT true,
      supports_multiple_columns BOOLEAN DEFAULT true,
      is_ats_friendly BOOLEAN DEFAULT false,
      required_tier VARCHAR(50) DEFAULT 'free',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Template styling configurations
    CREATE TABLE IF NOT EXISTS template_configurations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id UUID UNIQUE REFERENCES templates(id) ON DELETE CASCADE,
      layout JSONB NOT NULL DEFAULT '{"columns": 1, "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}, "sectionSpacing": 12}',
      typography JSONB NOT NULL DEFAULT '{"headingFont": "Inter", "bodyFont": "Roboto", "sizes": {"name": 24, "heading": 16, "subheading": 14, "body": 11}}',
      color_scheme JSONB NOT NULL DEFAULT '{"primary": "#2563eb", "secondary": "#64748b", "accent": "#3b82f6", "text": "#1e293b", "background": "#ffffff"}',
      sections JSONB NOT NULL DEFAULT '{"available": ["personal_info", "summary", "experience", "education", "skills"], "defaultOrder": ["personal_info", "summary", "experience", "education", "skills"]}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- User subscriptions
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      tier VARCHAR(50) NOT NULL DEFAULT 'free',
      status VARCHAR(50) DEFAULT 'active',
      amount_paid DECIMAL(10, 2),
      currency VARCHAR(3) DEFAULT 'USD',
      billing_cycle VARCHAR(20),
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP WITH TIME ZONE,
      cancelled_at TIMESTAMP WITH TIME ZONE,
      stripe_subscription_id VARCHAR(255),
      stripe_customer_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );

    -- Resume change history (uses template names since resumes.template_id is VARCHAR)
    CREATE TABLE IF NOT EXISTS resume_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      change_type VARCHAR(50) NOT NULL,
      previous_template_name VARCHAR(50),
      new_template_name VARCHAR(50),
      changed_fields JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active, sort_order);
    CREATE INDEX IF NOT EXISTS idx_templates_tier ON templates(required_tier);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id) WHERE status = 'active';
    CREATE INDEX IF NOT EXISTS idx_resume_history_resume ON resume_history(resume_id);
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    DROP INDEX IF EXISTS idx_resume_history_resume;
    DROP INDEX IF EXISTS idx_subscriptions_user;
    DROP INDEX IF EXISTS idx_templates_tier;
    DROP INDEX IF EXISTS idx_templates_active;
    DROP TABLE IF EXISTS resume_history CASCADE;
    DROP TABLE IF EXISTS subscriptions CASCADE;
    DROP TABLE IF EXISTS template_configurations CASCADE;
    DROP TABLE IF EXISTS templates CASCADE;
  `);
}
