import { useState, useEffect } from 'react';
import { Template, SubscriptionTier } from '../types/template.types';
import { getTemplates } from '../utils/api';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userTier, setUserTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTemplates();
      setTemplates(data.templates);
      setUserTier(data.userTier);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  return { templates, userTier, loading, error, reload: load };
}
