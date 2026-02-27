import { useState } from 'react';
import { switchResumeTemplate } from '../utils/api';
import { Template } from '../types/template.types';

export function useTemplateSwitch(
  resumeId: string,
  onSuccess?: (template: Template) => void
) {
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSwitch = async (templateId: string): Promise<boolean> => {
    try {
      setSwitching(true);
      setError(null);
      const data = await switchResumeTemplate(resumeId, templateId);
      onSuccess?.(data.template);
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to switch template';
      setError(msg);
      return false;
    } finally {
      setSwitching(false);
    }
  };

  return { doSwitch, switching, error };
}
