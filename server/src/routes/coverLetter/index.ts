import { Router } from 'express';
import { body, oneOf } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { isAuthenticated } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  extractKeywords,
  generateCoverLetter,
  listCoverLetters,
  listCoverLettersByResume,
  getCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  regenerateCoverLetter,
  improveCoverLetter,
} from '../../controllers/coverLetterController';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const extractKeywordsValidators = [
  oneOf([
    body('resumeId').exists().isUUID(),
    body('resumeText').exists().isString().notEmpty(),
  ], { message: 'Either resumeId (UUID) or resumeText is required' }),
  body('jobDescription')
    .exists()
    .isString()
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Job description is required and must be 5000 characters or fewer'),
];

const generateValidators = [
  body('fullName').exists().isString().notEmpty().withMessage('Full name is required'),
  body('jobDescription')
    .exists()
    .isString()
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Job description is required and must be 5000 characters or fewer'),
  body('companyName').exists().isString().notEmpty().withMessage('Company name is required'),
  body('tone')
    .exists()
    .isIn(['professional', 'enthusiastic', 'formal', 'conversational'])
    .withMessage('Tone must be one of: professional, enthusiastic, formal, conversational'),
  body('wordCountTarget')
    .exists()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Word count target must be one of: short, medium, long'),
  body('resumeId').optional().isUUID().withMessage('resumeId must be a valid UUID'),
  body('resumeText').optional().isString().isLength({ max: 5000 }),
  body('targetRole').optional().isString(),
  body('targetLocation').optional().isString(),
  body('matchedKeywords').optional().isArray(),
  body('missingKeywords').optional().isArray(),
  body('hiringManagerName').optional().isString().trim().isLength({ max: 255 }),
  body('jobTitle').optional().isString().trim().isLength({ max: 255 }),
  body('customInstructions')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Custom instructions must be 500 characters or fewer.'),
];

const regenerateValidators = [
  body('fullName').exists().isString().notEmpty().withMessage('Full name is required'),
  body('targetRole').optional().isString(),
  body('targetLocation').optional().isString(),
  body('jobDescription')
    .exists()
    .isString()
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Job description is required and must be 5000 characters or fewer'),
  body('companyName').exists().isString().notEmpty().withMessage('Company name is required'),
  body('tone')
    .exists()
    .isIn(['professional', 'enthusiastic', 'formal', 'conversational'])
    .withMessage('Tone must be one of: professional, enthusiastic, formal, conversational'),
  body('wordCountTarget')
    .exists()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Word count target must be one of: short, medium, long'),
  body('matchedKeywords').optional().isArray(),
  body('missingKeywords').optional().isArray(),
  body('hiringManagerName').optional().isString().trim().isLength({ max: 255 }),
  body('jobTitle').optional().isString().trim().isLength({ max: 255 }),
  body('customInstructions')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Custom instructions must be 500 characters or fewer.'),
];

const updateValidators = [
  body('content')
    .exists()
    .isString()
    .notEmpty()
    .isLength({ max: 10000 })
    .withMessage('Content is required and must be 10000 characters or fewer'),
];

const improveValidators = [
  body('whyThisCompany').optional().isString().isLength({ max: 300 })
    .withMessage('whyThisCompany must be 300 characters or fewer'),
  body('achievementToHighlight').optional().isString().isLength({ max: 200 })
    .withMessage('achievementToHighlight must be 200 characters or fewer'),
];

// Static routes first, then dynamic /:id routes
router.post('/extract-keywords', isAuthenticated, aiLimiter, extractKeywordsValidators, validate, extractKeywords);
router.get('/', isAuthenticated, listCoverLetters);
router.post('/generate', isAuthenticated, aiLimiter, generateValidators, validate, generateCoverLetter);
router.get('/resume/:resumeId', isAuthenticated, listCoverLettersByResume);
router.get('/:id', isAuthenticated, getCoverLetter);
router.put('/:id', isAuthenticated, updateValidators, validate, updateCoverLetter);
router.delete('/:id', isAuthenticated, deleteCoverLetter);
router.post('/:id/regenerate', isAuthenticated, aiLimiter, regenerateValidators, validate, regenerateCoverLetter);
router.post('/:id/improve', isAuthenticated, aiLimiter, improveValidators, validate, improveCoverLetter);

export default router;
