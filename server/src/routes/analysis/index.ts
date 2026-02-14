import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { analysisValidators } from '../../middleware/validators/analysisValidators';
import { validate } from '../../middleware/validate';
import {
  getMatchPercentage,
  getImprovements,
  getAtsScore,
} from '../../controllers/analysisController';

const router = Router();

router.use(isAuthenticated);

router.post('/match', analysisValidators, validate, getMatchPercentage);
router.post('/improve', analysisValidators, validate, getImprovements);
router.post('/ats-score', analysisValidators, validate, getAtsScore);

export default router;
