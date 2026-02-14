/**
 * Template Configuration System
 *
 * Defines visual styles and structure for resume templates.
 * Used by both frontend preview and backend PDF generation.
 */

export type TemplateId = 'ats' | 'simple';

export interface TemplateStyles {
  // Font settings
  fontFamily: string;
  fontSize: {
    body: string;
    heading: string;
    name: string;
    subheading: string;
  };
  // Spacing
  lineHeight: string;
  sectionSpacing: string;
  paragraphSpacing: string;
  // Colors (ATS-safe only)
  textColor: string;
  accentColor?: string;
  headingColor?: string;
  // Layout
  margins: string;
  pageWidth: string;
  bulletStyle: string;
  borderStyle?: string;
}

export interface TemplateSections {
  order: string[];
  headingFormat: 'uppercase' | 'titlecase' | 'lowercase';
  showSectionDividers: boolean;
  dividerStyle?: 'line' | 'spacing';
}

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
  styles: TemplateStyles;
  sections: TemplateSections;
  preview: {
    sampleData: {
      name: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
    };
  };
}

/**
 * ATS Template
 *
 * Maximum compatibility with Applicant Tracking Systems.
 * Strict formatting, no graphics, standard fonts only.
 *
 * Features:
 * - Arial font (universally readable)
 * - Black text only (no colors)
 * - Standard section order
 * - No dividers or decorative elements
 * - Optimized for ATS parsing
 */
export const ATS_TEMPLATE: Template = {
  id: 'ats',
  name: 'ATS Template',
  description: 'Maximum compatibility with Applicant Tracking Systems',
  thumbnail: '/assets/templates/ats-preview.svg',
  isPremium: false,
  styles: {
    fontFamily: 'Arial, sans-serif',
    fontSize: {
      body: '11pt',
      heading: '12pt',
      name: '14pt',
      subheading: '11pt',
    },
    lineHeight: '1.15',
    sectionSpacing: '12pt',
    paragraphSpacing: '6pt',
    textColor: '#000000',
    margins: '0.75in',
    pageWidth: '8.5in',
    bulletStyle: 'disc',
  },
  sections: {
    order: [
      'contact',
      'summary',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications',
      'activities',
    ],
    headingFormat: 'uppercase',
    showSectionDividers: false,
  },
  preview: {
    sampleData: {
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '+1-555-123-4567',
      location: 'San Francisco, CA',
      summary:
        'Recent Computer Science graduate with experience in full-stack development and data analysis. Demonstrated ability to build scalable applications through internships at leading tech companies.',
    },
  },
};

/**
 * Simple Template
 *
 * Clean, modern design with subtle styling.
 * Still ATS-safe, but more visually appealing.
 *
 * Features:
 * - Calibri font (professional, readable)
 * - Subtle accent color for headings
 * - Section dividers for visual separation
 * - Title case headings
 * - Balanced white space
 */
export const SIMPLE_TEMPLATE: Template = {
  id: 'simple',
  name: 'Simple Template',
  description: 'Clean, modern design with subtle styling',
  thumbnail: '/assets/templates/simple-preview.svg',
  isPremium: false,
  styles: {
    fontFamily: 'Calibri, sans-serif',
    fontSize: {
      body: '11pt',
      heading: '12pt',
      name: '16pt',
      subheading: '11pt',
    },
    lineHeight: '1.25',
    sectionSpacing: '14pt',
    paragraphSpacing: '8pt',
    textColor: '#000000',
    accentColor: '#4A4A4A',
    headingColor: '#2C3E50',
    margins: '0.75in',
    pageWidth: '8.5in',
    bulletStyle: 'square',
    borderStyle: '1px solid #CCCCCC',
  },
  sections: {
    order: [
      'contact',
      'summary',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications',
      'activities',
    ],
    headingFormat: 'titlecase',
    showSectionDividers: true,
    dividerStyle: 'line',
  },
  preview: {
    sampleData: {
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '+1-555-123-4567',
      location: 'San Francisco, CA',
      summary:
        'Recent Computer Science graduate with experience in full-stack development and data analysis. Demonstrated ability to build scalable applications through internships at leading tech companies.',
    },
  },
};

/**
 * Template Registry
 *
 * Central registry of all available templates.
 * Use this to access templates by ID.
 */
export const TEMPLATES: Record<TemplateId, Template> = {
  ats: ATS_TEMPLATE,
  simple: SIMPLE_TEMPLATE,
};

/**
 * Get template by ID
 *
 * @param templateId - Template identifier
 * @returns Template configuration or undefined if not found
 */
export function getTemplate(templateId: string): Template | undefined {
  return TEMPLATES[templateId as TemplateId];
}

/**
 * Get all available templates
 *
 * @returns Array of all template configurations
 */
export function getAllTemplates(): Template[] {
  return Object.values(TEMPLATES);
}

/**
 * Validate template ID
 *
 * @param templateId - Template identifier to validate
 * @returns True if template ID is valid
 */
export function isValidTemplateId(templateId: string): templateId is TemplateId {
  return templateId === 'ats' || templateId === 'simple';
}

/**
 * Get default template
 *
 * @returns Default template (ATS)
 */
export function getDefaultTemplate(): Template {
  return ATS_TEMPLATE;
}
