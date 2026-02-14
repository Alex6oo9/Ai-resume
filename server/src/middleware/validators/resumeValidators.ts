import { body } from 'express-validator';

export const resumeValidators = [
  body('targetRole')
    .exists()
    .withMessage('Target role is required')
    .isString()
    .withMessage('Target role must be a string')
    .trim()
    .notEmpty()
    .withMessage('Target role cannot be empty'),
  body('targetCountry')
    .exists()
    .withMessage('Target country is required')
    .isString()
    .withMessage('Target country must be a string')
    .trim()
    .notEmpty()
    .withMessage('Target country cannot be empty'),
  body('targetCity')
    .optional()
    .isString()
    .withMessage('Target city must be a string')
    .trim(),
];

export const buildResumeValidators = [
  body('fullName')
    .exists()
    .withMessage('Full name is required')
    .isString()
    .withMessage('Full name must be a string')
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),
  body('email')
    .exists()
    .withMessage('Email is required')
    .isString()
    .withMessage('Email must be a string')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .exists()
    .withMessage('Phone is required')
    .isString()
    .withMessage('Phone must be a string')
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty'),
  body('targetRole')
    .exists()
    .withMessage('Target role is required')
    .isString()
    .withMessage('Target role must be a string')
    .trim()
    .notEmpty()
    .withMessage('Target role cannot be empty'),
  body('targetCountry')
    .exists()
    .withMessage('Target country is required')
    .isString()
    .withMessage('Target country must be a string')
    .trim()
    .notEmpty()
    .withMessage('Target country cannot be empty'),
  body('education')
    .exists()
    .withMessage('Education is required')
    .isArray({ min: 1 })
    .withMessage('At least one education entry is required'),
  body('professionalSummary')
    .exists()
    .withMessage('Professional summary is required')
    .isString()
    .withMessage('Professional summary must be a string')
    .trim()
    .notEmpty()
    .withMessage('Professional summary cannot be empty'),
];
