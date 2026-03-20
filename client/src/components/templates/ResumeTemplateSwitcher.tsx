import type { ComponentType } from 'react';
import type { ResumeTemplateProps, TemplateId } from './types';
import ModernTemplate from './ModernTemplate';
import ModernYellowSplitTemplate from './ModernYellowSplit';
import DarkRibbonModernTemplate from './DarkRibbonModernTemplate';
import ModernMinimalistBlock from './ModernMinimalistBlock';
import EditorialEarthTone from './EditorialEarthTone';
import ATSCleanTemplate from './ATSCleanTemplate';
import ATSLinedTemplate from './ATSLinedTemplate';

const TEMPLATE_MAP: Record<TemplateId, ComponentType<ResumeTemplateProps>> = {
  modern: ModernTemplate,
  modern_yellow_split: ModernYellowSplitTemplate,
  dark_ribbon_modern: DarkRibbonModernTemplate,
  modern_minimalist_block: ModernMinimalistBlock,
  editorial_earth_tone: EditorialEarthTone,
  ats_clean: ATSCleanTemplate,
  ats_lined: ATSLinedTemplate,
};

interface Props extends ResumeTemplateProps {
  templateId: string;
}

/**
 * ResumeTemplateSwitcher
 *
 * Resolves a template ID string to the correct template component and renders it.
 * Falls back to ModernTemplate for unknown IDs.
 */
export default function ResumeTemplateSwitcher({ templateId, data, isPreview }: Props) {
  const TemplateComponent =
    TEMPLATE_MAP[templateId as TemplateId] ?? ModernTemplate;
  return <TemplateComponent data={data} isPreview={isPreview} />;
}
