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
  getResumeFile,
  deleteResume,
  listResumes,
  saveDraft,
  loadDraft,
} from '../../controllers/resumeController';
import { switchTemplate } from '../../controllers/templateController';

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
router.post('/draft/save', saveDraft);
router.get('/draft/:id', loadDraft);
router.get('/:id/file', getResumeFile);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.post('/:id/switch-template', switchTemplate);

export default router;
