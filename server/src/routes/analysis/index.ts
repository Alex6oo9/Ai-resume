import { Router } from 'express';
import { body } from 'express-validator';
import { isAuthenticated } from '../../middleware/auth';
import { analysisValidators } from '../../middleware/validators/analysisValidators';
import { validate } from '../../middleware/validate';
import {
  getMatchPercentage,
  getImprovements,
  getAtsScore,
  reanalyze,
  getAnalysisHistory,
} from '../../controllers/analysisController';

const router = Router();

router.use(isAuthenticated);

const reanalyzeValidators = [
  body('resumeId').exists().isString().trim().notEmpty(),
  body('targetRole').exists().isString().trim().notEmpty(),
  body('targetCountry').optional().isString().trim(),
  body('targetCity').optional().isString().trim(),
  body('jobDescription').optional().isString().trim().isLength({ max: 5000 }),
];

router.post('/match', analysisValidators, validate, getMatchPercentage);
router.post('/improve', analysisValidators, validate, getImprovements);
router.post('/ats-score', analysisValidators, validate, getAtsScore);
router.post('/reanalyze', reanalyzeValidators, validate, reanalyze);
router.get('/history/:resumeId', getAnalysisHistory);

export default router;
