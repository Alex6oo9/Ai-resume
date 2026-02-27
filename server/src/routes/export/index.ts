import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { exportPdf, exportMarkdown, exportPdfFromHtml } from '../../controllers/exportController';

const router = Router();

router.use(isAuthenticated);

router.get('/pdf/:resumeId', exportPdf);
router.get('/markdown/:resumeId', exportMarkdown);
router.post('/pdf-from-html', exportPdfFromHtml);

export default router;
