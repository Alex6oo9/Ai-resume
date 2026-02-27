import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import {
  getTemplates,
  getTemplate,
} from '../../controllers/templateController';

const router = Router();

router.use(isAuthenticated);

router.get('/', getTemplates);
router.get('/:id', getTemplate);

export default router;
