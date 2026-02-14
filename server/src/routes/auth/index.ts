import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe } from '../../controllers/authController';
import { isAuthenticated } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);

router.get('/me', isAuthenticated, getMe);

export default router;
