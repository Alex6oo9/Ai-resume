import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { uploadMiddleware } from '../../middleware/upload';
import {
  resumeValidators,
  buildResumeValidators,
} from '../../middleware/validators/resumeValidators';
import { validate } from '../../middleware/validate';
import {
  uploadResume,
  buildResume,
  getResume,
  deleteResume,
  listResumes,
} from '../../controllers/resumeController';

const router = Router();

// All resume routes require authentication
router.use(isAuthenticated);

router.get('/', listResumes);
router.post(
  '/upload',
  uploadMiddleware().single('file'),
  resumeValidators,
  validate,
  uploadResume
);
router.post('/build', buildResumeValidators, validate, buildResume);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

export default router;
