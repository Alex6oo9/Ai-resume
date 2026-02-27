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
  isLocked?: boolean; // Computed per user, not stored
  sortOrder: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  expiresAt?: Date;
}
