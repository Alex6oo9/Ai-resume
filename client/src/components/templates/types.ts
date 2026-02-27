import type { ResumeFormData } from '../../types';

export interface ResumeTemplateProps {
  data: ResumeFormData;
  isPreview?: boolean;
}

export type TemplateId =
  | 'modern_minimal'
  | 'creative_bold'
  | 'professional_classic'
  | 'tech_focused'
  | 'healthcare_pro'
  | 'warm_creative'
  | 'sleek_director'
  | 'modern_yellow_split'
  | 'dark_ribbon_modern'
  | 'modern_minimalist_block'
  | 'editorial_earth_tone';
