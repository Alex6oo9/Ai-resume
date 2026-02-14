import { body } from 'express-validator';

export const exportValidators = [
  body('resumeId')
    .trim()
    .notEmpty()
    .withMessage('Resume ID is required'),
];
