import type { ComponentType } from 'react';
import type { ResumeTemplateProps, TemplateId } from './types';
import ModernMinimalTemplate from './ModernMinimalTemplate';
import CreativeBoldTemplate from './CreativeBoldTemplate';
import ProfessionalClassicTemplate from './ProfessionalClassicTemplate';
import TechFocusedTemplate from './TechFocusedTemplate';
import HealthcareProTemplate from './HealthcareProTemplate';
import WarmCreativeTemplate from './WarmCreativeTemplate';
import SleekDirectorTemplate from './SleekDirectorTemplate';
import ModernYellowSplitTemplate from './ModernYellowSplit';
import DarkRibbonModernTemplate from './DarkRibbonModernTemplate';
import ModernMinimalistBlock from './ModernMinimalistBlock';
import EditorialEarthTone from './EditorialEarthTone';

const TEMPLATE_MAP: Record<TemplateId, ComponentType<ResumeTemplateProps>> = {
  modern_minimal: ModernMinimalTemplate,
  creative_bold: CreativeBoldTemplate,
  professional_classic: ProfessionalClassicTemplate,
  tech_focused: TechFocusedTemplate,
  healthcare_pro: HealthcareProTemplate,
  warm_creative: WarmCreativeTemplate,
  sleek_director: SleekDirectorTemplate,
  modern_yellow_split: ModernYellowSplitTemplate,
  dark_ribbon_modern: DarkRibbonModernTemplate,
  modern_minimalist_block: ModernMinimalistBlock,
  editorial_earth_tone: EditorialEarthTone,
};

interface Props extends ResumeTemplateProps {
  templateId: string;
}

/**
 * ResumeTemplateSwitcher
 *
 * Resolves a template ID string to the correct template component and renders it.
 * Falls back to ModernMinimalTemplate for unknown IDs.
 */
export default function ResumeTemplateSwitcher({ templateId, data, isPreview }: Props) {
  const TemplateComponent =
    TEMPLATE_MAP[templateId as TemplateId] ?? ModernMinimalTemplate;
  return <TemplateComponent data={data} isPreview={isPreview} />;
}
