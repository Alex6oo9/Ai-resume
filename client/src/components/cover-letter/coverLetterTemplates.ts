export type CoverLetterTemplateId = 'classic' | 'bold_architect';

export interface CoverLetterTemplate {
  id: CoverLetterTemplateId;
  label: string;
  description: string;
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Left-aligned name & contact row',
  },
  {
    id: 'bold_architect',
    label: 'Bold Architect',
    description: 'Centered title, icon contacts, black rule',
  },
];

export const DEFAULT_TEMPLATE_ID: CoverLetterTemplateId = 'classic';
