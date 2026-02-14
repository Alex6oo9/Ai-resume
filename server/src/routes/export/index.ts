import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { exportPdf, exportMarkdown } from '../../controllers/exportController';

const router = Router();

router.use(isAuthenticated);

router.get('/pdf/:resumeId', exportPdf);
router.get('/markdown/:resumeId', exportMarkdown);

export default router;
