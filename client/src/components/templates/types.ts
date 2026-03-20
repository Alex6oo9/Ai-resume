import type { ResumeFormData } from '../../types';

export interface ResumeTemplateProps {
  data: ResumeFormData;
  isPreview?: boolean;
}

export type TemplateId =
  | 'modern'
  | 'modern_yellow_split'
  | 'dark_ribbon_modern'
  | 'modern_minimalist_block'
  | 'editorial_earth_tone'
  | 'ats_clean'
  | 'ats_lined';
