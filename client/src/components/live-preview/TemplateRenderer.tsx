/**
 * TemplateRenderer — compatibility shim
 *
 * Forwards to ResumeTemplateSwitcher. Kept so existing imports continue
 * to work during migration. Can be deleted once all callers are updated.
 */
import type { ResumeFormData } from '../../types';
import ResumeTemplateSwitcher from '../templates/ResumeTemplateSwitcher';

interface Props {
  data: ResumeFormData;
  templateId: string;
}

export default function TemplateRenderer({ data, templateId }: Props) {
  return <ResumeTemplateSwitcher templateId={templateId} data={data} />;
}
