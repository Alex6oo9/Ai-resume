import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../../controllers/authController';
import { isAuthenticated, isGuest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name').optional().trim().isLength({ max: 255 }).withMessage('Name too long'),
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

router.get('/verify-email', verifyEmail);

router.post(
  '/resend-verification',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ],
  validate,
  resendVerification
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
);

// Google OAuth
router.get('/google', isGuest, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth` }),
  (req, res) => {
    // Regenerate session to prevent session fixation
    const user = req.user;
    req.session.regenerate((err) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth`);
      }
      req.login(user as Express.User, (loginErr) => {
        if (loginErr) {
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth`);
        }
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
      });
    });
  }
);

export default router;
