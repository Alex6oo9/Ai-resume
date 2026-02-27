import { Request, Response, NextFunction } from 'express';
import {
  getAllTemplates,
  getTemplateWithConfig,
  getUserTier,
  canUserAccessTemplate,
  switchResumeTemplate,
} from '../services/templateQueries';
import { SubscriptionTier } from '../types/template.types';

const TIER_LEVEL: Record<SubscriptionTier, number> = {
  free: 0,
  monthly: 1,
  annual: 2,
};

export const getTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).id;
    const [templates, userTier] = await Promise.all([
      getAllTemplates(),
      getUserTier(userId),
    ]);

    const result = templates.map((t) => ({
      ...t,
      isLocked: TIER_LEVEL[userTier] < TIER_LEVEL[t.requiredTier],
    }));

    res.json({ templates: result, userTier });
  } catch (err) {
    next(err);
  }
};

export const getTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const template = await getTemplateWithConfig(id);
    if (!template) {
      res.status(404).json({ message: 'Template not found' });
      return;
    }
    res.json({ template });
  } catch (err) {
    next(err);
  }
};

export const switchTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).id;
    const { id: resumeId } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      res.status(400).json({ message: 'templateId is required' });
      return;
    }

    const canAccess = await canUserAccessTemplate(userId, templateId);
    if (!canAccess) {
      res.status(403).json({
        message: 'This template requires a paid subscription',
      });
      return;
    }

    await switchResumeTemplate(resumeId, userId, templateId);
    const template = await getTemplateWithConfig(templateId);

    res.json({ message: 'Template switched successfully', template });
  } catch (err) {
    next(err);
  }
};
