import express from 'express';
import { generateSkillsEndpoint, generateSummaryEndpoint } from '../../controllers/aiController';
import { isAuthenticated } from '../../middleware/auth';

const router = express.Router();

/**
 * AI generation routes
 * All routes require authentication
 */

/**
 * POST /api/ai/generate-skills
 * Generate skills based on target role and industry
 */
router.post('/generate-skills', isAuthenticated, generateSkillsEndpoint);

/**
 * POST /api/ai/generate-summary
 * Generate professional summary using resume context
 */
router.post('/generate-summary', isAuthenticated, generateSummaryEndpoint);

export default router;
