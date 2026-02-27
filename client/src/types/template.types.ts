export type SubscriptionTier = 'free' | 'monthly' | 'annual';

export interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'modern' | 'ats' | 'creative' | 'professional';
  thumbnailUrl?: string;
  supportsMultipleColumns: boolean;
  isAtsFriendly: boolean;
  requiredTier: SubscriptionTier;
  isLocked?: boolean;
  sortOrder: number;
}
