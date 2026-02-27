/**
 * Template registry for the live preview template selector UI.
 *
 * All rendering logic now lives in per-template components under
 * `client/src/components/templates/`. This file only provides the
 * basic info (id, name, description, isPremium) needed by the
 * TemplateSelector picker UI.
 */

// Re-export canonical TemplateId for any legacy callers
export type { TemplateId } from '../templates/types';

export interface TemplateBasicInfo {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
}

const TEMPLATES: TemplateBasicInfo[] = [
  {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    description: 'Clean single-column design with blue accents and optional photo',
    isPremium: false,
  },
  {
    id: 'creative_bold',
    name: 'Creative Bold',
    description: 'Two-column sidebar with purple tones for creative professionals',
    isPremium: false,
  },
  {
    id: 'professional_classic',
    name: 'Professional Classic',
    description: 'Elegant serif typography with navy and gold for corporate roles',
    isPremium: false,
  },
  {
    id: 'tech_focused',
    name: 'Tech Focused',
    description: 'Skills-first compact layout with monospace headings for developers',
    isPremium: false,
  },
  {
    id: 'healthcare_pro',
    name: 'Healthcare Professional',
    description: 'Clean teal header band design for healthcare professionals',
    isPremium: false,
  },
  {
    id: 'warm_creative',
    name: 'Warm Creative',
    description: 'Warm terracotta tones for creative content professionals',
    isPremium: false,
  },
  {
    id: 'sleek_director',
    name: 'Sleek Director',
    description: 'Swiss-inspired cylinder sidebar with bold typography for directors',
    isPremium: false,
  },
];

export function getAllTemplates(): TemplateBasicInfo[] {
  return TEMPLATES;
}

export function getTemplate(id: string): TemplateBasicInfo {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
