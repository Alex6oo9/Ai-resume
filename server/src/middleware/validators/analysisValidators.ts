import { body } from 'express-validator';

export const analysisValidators = [
  body('resumeId')
    .exists()
    .withMessage('Resume ID is required')
    .isString()
    .withMessage('Resume ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('Resume ID cannot be empty'),
  body('jobDescription')
    .optional()
    .isString()
    .withMessage('Job description must be a string')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Job description cannot exceed 5000 characters'),
];
